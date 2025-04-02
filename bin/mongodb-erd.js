#!/usr/bin/env node

import { program } from 'commander';
import { generateERD } from '../src/index.js';
import { listDatabases, listCollections } from '../src/lib/mongoIntrospector.js';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

program
  .name('mongodb-erd')
  .description('Generate Entity-Relationship Diagrams (ERD) from MongoDB databases')
  .version(packageJson.version)
  .option('-u, --uri <uri>', 'MongoDB connection URI')
  .option('-d, --database <database>', 'Database name')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format (svg, png, pdf, ascii, mermaid)', 'svg')
  .option('-t, --theme <theme>', 'Theme (light, dark)', 'light')
  .option('-i, --include <collections>', 'Comma-separated list of collections to include')
  .option('-e, --exclude <collections>', 'Comma-separated list of collections to exclude')
  .parse();

const options = program.opts();

async function main() {
  try {
    if (!options.uri) {
      console.error('Error: MongoDB URI is required');
      process.exit(1);
    }

    let database = options.database;
    let collections = [];

    if (!database) {
      // Interactive mode - select database
      const databases = await listDatabases(options.uri);
      const { selectedDatabase } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedDatabase',
          message: 'Select a database:',
          choices: databases
        }
      ]);
      database = selectedDatabase;
    }

    if (options.include) {
      // Use specified collections
      collections = options.include.split(',').map(c => c.trim());
    } else if (!options.database) {
      // Interactive mode - select collections
      const availableCollections = await listCollections(options.uri, database);
      const { selectedCollections } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedCollections',
          message: 'Select collections to include:',
          choices: availableCollections
        }
      ]);
      collections = selectedCollections;
    }

    // Set default output path if not provided
    let outputPath = options.output;
    if (!outputPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = options.format === 'ascii' ? 'txt' : 
                       options.format === 'mermaid' ? 'mmd' : 
                       options.format;
      outputPath = `erd_${timestamp}.${extension}`;
    }

    await generateERD({
      uri: options.uri,
      database,
      collections,
      outputPath,
      format: options.format,
      theme: options.theme
    });

    console.log(`ERD generated successfully at: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();