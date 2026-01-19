import {inlineSource} from 'inline-source';
import path from 'node:path';
import fs from 'node:fs';

const srcPath = path.resolve('src');

function customHandler(source, context) {
  const absolutePath = path.resolve(srcPath, source.filepath);

  const filesToCompress = [
    path.resolve(srcPath, 'gll.bundle.js'),
    path.resolve(srcPath, 'style.css')
  ];

  if (filesToCompress.includes(absolutePath)) {
    source.compress = true;
  }

  return source;
}

async function main() {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];

  if (!inputFile || !outputFile) {
    console.error('Usage: node inline_single_file.js <input-file> <output-file>');
    process.exit(1);
  }

  const htmlpath = path.resolve(inputFile);

  try {
    const html = await inlineSource(htmlpath, {
      rootpath: srcPath,
      attribute: 'inline',
      compress: true,
      handlers: [customHandler]
    });

    fs.writeFileSync(outputFile, html);
    console.log(`File written successfully to ${outputFile}`);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();