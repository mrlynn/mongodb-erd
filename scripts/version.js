import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get current version
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
);

const version = packageJson.version;
const date = new Date().toISOString().split('T')[0];

// Read CHANGELOG.md
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');

// Add new version section if it doesn't exist
if (!changelog.includes(`## [${version}]`)) {
  const newVersion = `\n## [${version}] - ${date}\n\n### Added\n- \n\n### Changed\n- \n\n### Deprecated\n- \n\n### Removed\n- \n\n### Fixed\n- \n\n### Security\n- \n\n`;
  changelog = newVersion + changelog;
  fs.writeFileSync(changelogPath, changelog);
} 