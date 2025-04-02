#!/usr/bin/env node

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { generateERD } from '../src/index.js';
import { listDatabases, listCollections } from '../src/lib/mongoIntrospector.js';
import inquirer from 'inquirer';
import boxen from 'boxen';

// Load environment variables from .env file if it exists
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program
  .name('mongodb-erd')
  .description('Generate Entity Relationship Diagrams from MongoDB databases')
  .version('2.5.2')
  .option('-u, --uri <uri>', 'MongoDB connection URI')
  .option('-d, --database <database>', 'Database name')
  .option('-i, --include <collections...>', 'Collections to include')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format (svg, png, pdf, ascii, mermaid)', 'svg')
  .option('-t, --theme <theme>', 'Theme (light, dark)', 'light')
  .action(async (options) => {
    try {
      // Get MongoDB URI from environment variable or command line
      const uri = options.uri || process.env.MONGODB_URI;
      if (!uri) {
        console.error('Error: MongoDB URI is required. Use --uri or set MONGODB_URI environment variable.');
        process.exit(1);
      }

      // Get database from command line or environment
      const database = options.database || process.env.MONGODB_DATABASE;
      let selectedDatabase = database;
      let selectedCollections = options.include;

      // If no database specified, show interactive selection
      if (!selectedDatabase) {
        const databases = await listDatabases(uri);
        const { database } = await inquirer.prompt([
          {
            type: 'list',
            name: 'database',
            message: 'Select a database:',
            choices: databases
          }
        ]);
        selectedDatabase = database;
      }

      // If no collections specified and no database was provided via CLI, show interactive selection
      if (!selectedCollections && !database) {
        const collections = await listCollections(uri, selectedDatabase);
        const { collections: selected } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'collections',
            message: 'Select collections to include:',
            choices: collections
          }
        ]);
        selectedCollections = selected;
      }

      // Generate output path if not provided
      let outputPath = options.output;
      if (!outputPath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = options.format === 'ascii' ? 'txt' : options.format;
        outputPath = `erd_${timestamp}.${extension}`;
      }

      // Generate the ERD
      await generateERD({
        uri,
        database: selectedDatabase,
        collections: selectedCollections,
        outputPath,
        format: options.format,
        theme: options.theme
      });

      // Display success message
      console.log(boxen(
        `✨ ERD generated successfully!\n\n` +
        `📁 Output: ${outputPath}\n` +
        `📊 Format: ${options.format}\n` +
        `🎨 Theme: ${options.theme}`,
        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green' }
      ));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();