const XLSX = require('xlsx-js-style');
const fs = require('fs');
const path = require('path');

const SOURCE_EXCEL_FILE = path.join(__dirname, "..", "..", "templates", "GLL_template.xlsx");
const TARGET_JS_FILE = path.join(__dirname, "..", "..", "src", "gll.js");

function parseExcelToObject(filePath) {
  const wb = XLSX.readFile(filePath, { cellStyles: true });
  const result = {};

  wb.SheetNames.forEach(name => {
    const ws = wb.Sheets[name];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    const data = [];
    const styles = {};

    // Find last row with data
    let lastRowWithData = -1;
    for (let r = range.e.r; r >= range.s.r; r--) {
      let hasData = false;
      for (let c = range.s.c; c <= range.e.c; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        const cell = ws[ref];
        if (cell && (cell.w || cell.v)) {
          hasData = true;
          break;
        }
      }
      if (hasData) {
        lastRowWithData = r;
        break;
      }
    }

    for (let r = range.s.r; r <= lastRowWithData; r++) {
      const row = [];

      for (let c = range.s.c; c <= range.e.c; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        const cell = ws[ref];

        const value = cell ? (cell.w || cell.v || "") : "";
        row.push(value);

        if (cell?.s) {
          styles[ref] = cell.s;
        }
      }

      data.push(row);
    }

    const payload = { data };
    if (Object.keys(styles).length > 0) {
      payload.styles = styles;
    }

    result[name] = payload;
  });

  return result;
}

try {
  let content = fs.readFileSync(TARGET_JS_FILE, 'utf8');
  const excelData = parseExcelToObject(SOURCE_EXCEL_FILE);
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