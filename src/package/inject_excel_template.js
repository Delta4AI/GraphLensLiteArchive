const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const SOURCE_EXCEL_FILE = path.join(__dirname, "..", "..", "templates", "GLL_template.xlsx");
const TARGET_JS_FILE = path.join(__dirname, "..", "..", "src", "gll.js");

function parseExcelToObject(filePath) {
  const workbook = XLSX.readFile(filePath);
  const result = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    result[sheetName] = XLSX.utils.sheet_to_json(sheet);
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