import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_EXCEL_FILE = path.join(__dirname, "..", "..", "templates", "simple-template.xlsx");
const TARGET_JS_FILE = path.join(__dirname, "..", "..", "src", "managers", "io.js");

function compressExcelData(rawData) {
  const compressed = {
    s: {}, // sheets
    st: {}, // styles
    sc: 0   // styleCounter
  };

  // Global style deduplication across all sheets
  const globalStyleMap = new Map();

  Object.entries(rawData).forEach(([sheetName, sheet]) => {
    // Compress data - only store non-null values with their positions
    const sparseData = [];
    sheet.data.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
          sparseData.push([rowIndex, colIndex, cellValue]);
        }
      });
    });

    // Compress styles
    const compressedStyles = {};
    if (sheet.styles) {
      Object.entries(sheet.styles).forEach(([ref, styleId]) => {
        const style = sheet.styleMap[styleId];
        const styleKey = JSON.stringify(style);

        if (!globalStyleMap.has(styleKey)) {
          globalStyleMap.set(styleKey, compressed.sc);
          compressed.st[compressed.sc] = style;
          compressed.sc++;
        }

        compressedStyles[ref] = globalStyleMap.get(styleKey);
      });
    }

    compressed.s[sheetName] = {
      d: sparseData, // data
      st: Object.keys(compressedStyles).length > 0 ? compressedStyles : undefined, // styles
      dim: [sheet.data.length, sheet.data[0]?.length || 0] // dimensions
    };
  });

  return compressed;
}

function hashStyle(style) {
  return JSON.stringify(style);
}

async function parseExcelToObject(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const result = {};

  workbook.eachSheet((worksheet, sheetId) => {
    const data = [];
    const styles = {};
    const styleMap = {};
    const styleHashes = new Map();
    let styleCounter = 0;

    // Find the actual range with data
    const { actualRowCount, actualColumnCount } = worksheet;

    // Initialize sparse data structure
    for (let r = 1; r <= actualRowCount; r++) {
      const row = [];

      for (let c = 1; c <= actualColumnCount; c++) {
        const cell = worksheet.getCell(r, c);
        const value = cell.text || cell.value;

        // Only store non-empty values
        row.push(value || null);

        // Extract and compress styles
        if (cell.style && (cell.style.font || cell.style.fill || cell.style.border || cell.style.alignment)) {
          const ref = cell.address;
          const style = {};

          // Font styles - only store non-default values
          if (cell.style.font) {
            const font = {};
            if (cell.style.font.bold) font.b = 1;
            if (cell.style.font.italic) font.i = 1;
            if (cell.style.font.underline) font.u = 1;
            if (cell.style.font.strike) font.s = 1;
            if (cell.style.font.size && cell.style.font.size !== 11) font.sz = cell.style.font.size;
            if (cell.style.font.name && cell.style.font.name !== 'Calibri') font.n = cell.style.font.name;
            if (cell.style.font.color) {
              font.c = cell.style.font.color.argb?.substring(2) || "000000";
            }
            if (Object.keys(font).length > 0) style.f = font;
          }

          // Fill styles
          if (cell.style.fill && cell.style.fill.type === 'pattern') {
            const fill = {};
            if (cell.style.fill.pattern && cell.style.fill.pattern !== 'solid') {
              fill.p = cell.style.fill.pattern;
            }
            if (cell.style.fill.fgColor) {
              fill.fg = cell.style.fill.fgColor.argb?.substring(2) || "FFFFFF";
            }
            if (cell.style.fill.bgColor) {
              fill.bg = cell.style.fill.bgColor.argb?.substring(2) || "FFFFFF";
            }
            if (Object.keys(fill).length > 0) style.fill = fill;
          }

          // Border styles
          if (cell.style.border) {
            const border = {};
            ['top', 'bottom', 'left', 'right'].forEach((side, idx) => {
              if (cell.style.border[side] && cell.style.border[side].style) {
                border[['t','b','l','r'][idx]] = [
                  cell.style.border[side].style,
                  cell.style.border[side].color?.argb?.substring(2) || "000000"
                ];
              }
            });
            if (Object.keys(border).length > 0) style.b = border;
          }

          // Alignment - only store non-default values
          if (cell.style.alignment) {
            const alignment = {};
            if (cell.style.alignment.horizontal) alignment.h = cell.style.alignment.horizontal;
            if (cell.style.alignment.vertical) alignment.v = cell.style.alignment.vertical;
            if (cell.style.alignment.wrapText) alignment.w = 1;
            if (Object.keys(alignment).length > 0) style.a = alignment;
          }

          // Number format
          if (cell.style.numFmt) {
            style.nf = cell.style.numFmt;
          }

          if (Object.keys(style).length > 0) {
            const styleHash = hashStyle(style);

            // Reuse existing style if it exists
            if (styleHashes.has(styleHash)) {
              styles[ref] = styleHashes.get(styleHash);
            } else {
              const styleId = `s${styleCounter++}`;
              styleMap[styleId] = style;
              styleHashes.set(styleHash, styleId);
              styles[ref] = styleId;
            }
          }
        }
      }

      data.push(row);
    }

    const payload = { data };
    if (Object.keys(styles).length > 0) {
      payload.styles = styles;
      payload.styleMap = styleMap;
    }

    result[worksheet.name] = payload;
  });

  return result;
}

async function main() {
  try {
    let content = fs.readFileSync(TARGET_JS_FILE, 'utf8');
    const rawData = await parseExcelToObject(SOURCE_EXCEL_FILE);
    const compressedData = compressExcelData(rawData);

    console.log('Original size:', JSON.stringify(rawData, null, 2).length);
    console.log('Compressed size:', JSON.stringify(compressedData).length);
    console.log('Compression ratio:', (JSON.stringify(compressedData).length / JSON.stringify(rawData, null, 2).length * 100).toFixed(1) + '%');

    const regex = /let\s+excelData\s*=\s*{[\s\S]*?};/;

    const newContent = content.replace(
      regex,
      `let excelData = ${JSON.stringify(compressedData)};`
    );

    fs.writeFileSync(TARGET_JS_FILE, newContent, 'utf8');
    console.log('Successfully updated Excel data in JavaScript file');
  } catch (error) {
    console.error('Error updating Excel data:', error);
    process.exit(1);
  }
}

main();