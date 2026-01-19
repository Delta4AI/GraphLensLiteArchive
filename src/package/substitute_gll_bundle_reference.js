const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, '../graph_lens_lite.html');
const mode = process.argv[2]; // 'start' or 'end'

try {
  let content = fs.readFileSync(htmlFile, 'utf-8');

  if (mode === 'start') {
    // Replace gll.js with gll.bundle.js and add inline attribute
    content = content.replace(
      /<script type="module" src="gll\.js"><\/script>/g,
      '<script inline type="module" src="gll.bundle.js"></script>'
    );
    fs.writeFileSync(htmlFile, content, 'utf-8');
    console.log('✓ Switched to gll.bundle.js with inline attribute for production build');
  } else if (mode === 'end') {
    // Restore gll.bundle.js back to gll.js and remove inline attribute
    content = content.replace(
      /<script inline type="module" src="gll\.bundle\.js"><\/script>/g,
      '<script type="module" src="gll.js"></script>'
    );
    fs.writeFileSync(htmlFile, content, 'utf-8');
    console.log('✓ Restored to gll.js for development');
  } else {
    console.error('Usage: node substitute_gll.js [start|end]');
    process.exit(1);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}