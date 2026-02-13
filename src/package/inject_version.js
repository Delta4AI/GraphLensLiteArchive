const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../../package.json');
const configFilePath = path.join(__dirname, '../config.js');

try {
  // Read package.json to get the version
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const version = packageJson.version;

  // Read config.js
  let configContent = fs.readFileSync(configFilePath, 'utf-8');

  // Replace the VERSION constant
  configContent = configContent.replace(
    /const VERSION = "[^"]*";/,
    `const VERSION = "${version}";`
  );

  // Write back to config.js
  fs.writeFileSync(configFilePath, configContent, 'utf-8');
  console.log(`✓ Injected version ${version} into config.js`);
} catch (error) {
  console.error('Error injecting version:', error.message);
  process.exit(1);
}
