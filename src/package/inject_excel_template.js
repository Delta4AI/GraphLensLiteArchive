
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const SOURCE_EXCEL_FILE = path.join(__dirname, "..", "..", "templates", "GLL_template.xlsx");
const TARGET_JS_FILE = path.join(__dirname, "..", "..", "src", "gll.js");

async function parseExcelToObject(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const result = {};

  workbook.eachSheet((worksheet, sheetId) => {
    const data = [];
    const styles = {};
    
    // Find the actual range with data
    const { actualRowCount, actualColumnCount } = worksheet;
    
    for (let r = 1; r <= actualRowCount; r++) {
      const row = [];
      
      for (let c = 1; c <= actualColumnCount; c++) {
        const cell = worksheet.getCell(r, c);
        const value = cell.text || cell.value || "";
        row.push(value);
        
        // Extract styles if they exist
        if (cell.style && (cell.style.font || cell.style.fill || cell.style.border || cell.style.alignment)) {
          const ref = cell.address; // e.g., 'A1', 'B2', etc.
          const style = {};
          
          // Font styles
          if (cell.style.font) {
            style.font = {};
            if (cell.style.font.bold) style.font.bold = true;
            if (cell.style.font.italic) style.font.italic = true;
            if (cell.style.font.underline) style.font.underline = true;
            if (cell.style.font.strike) style.font.strike = true;
            if (cell.style.font.size) style.font.sz = cell.style.font.size;
            if (cell.style.font.name) style.font.name = cell.style.font.name;
            if (cell.style.font.color) {
              style.font.color = { rgb: cell.style.font.color.argb?.substring(2) || "000000" };
            }
          }
          
          // Fill styles
          if (cell.style.fill) {
            style.fill = {};
            if (cell.style.fill.type === 'pattern') {
              style.fill.patternType = cell.style.fill.pattern || "solid";
              if (cell.style.fill.fgColor) {
                style.fill.fgColor = { rgb: cell.style.fill.fgColor.argb?.substring(2) || "FFFFFF" };
              }
              if (cell.style.fill.bgColor) {
                style.fill.bgColor = { rgb: cell.style.fill.bgColor.argb?.substring(2) || "FFFFFF" };
              }
            }
          }
          
          // Border styles
          if (cell.style.border) {
            style.border = {};
            ['top', 'bottom', 'left', 'right'].forEach(side => {
              if (cell.style.border[side] && cell.style.border[side].style) {
                style.border[side] = {
                  style: cell.style.border[side].style,
                  color: { rgb: cell.style.border[side].color?.argb?.substring(2) || "000000" }
                };
              }
            });
          }
          
          // Alignment
          if (cell.style.alignment) {
            style.alignment = {};
            if (cell.style.alignment.horizontal) style.alignment.horizontal = cell.style.alignment.horizontal;
            if (cell.style.alignment.vertical) style.alignment.vertical = cell.style.alignment.vertical;
            if (cell.style.alignment.wrapText) style.alignment.wrapText = cell.style.alignment.wrapText;
          }
          
          // Number format
          if (cell.style.numFmt) {
            style.numFmt = cell.style.numFmt;
          }
          
          if (Object.keys(style).length > 0) {
            styles[ref] = style;
          }
        }
      }
      
      data.push(row);
    }
    
    const payload = { data };
    if (Object.keys(styles).length > 0) {
      payload.styles = styles;
    }
    
    result[worksheet.name] = payload;
  });

  return result;
}

async function main() {
  try {
    let content = fs.readFileSync(TARGET_JS_FILE, 'utf8');
    const excelData = await parseExcelToObject(SOURCE_EXCEL_FILE);
    const regex = /let\s+excelData\s*=\s*{[\s\S]*?};/;

    const newContent = content.replace(
      regex,
      `let excelData = ${JSON.stringify(excelData, null, 2)};`
    );

    fs.writeFileSync(TARGET_JS_FILE, newContent, 'utf8');
    console.log('Successfully updated Excel data in JavaScript file');
  } catch (error) {
    console.error('Error updating Excel data:', error);
    process.exit(1);
  }
}

main();