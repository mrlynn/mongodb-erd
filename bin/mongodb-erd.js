#!/usr/bin/env node

import { Command } from 'commander';
import { generateERD } from '../src/index.js';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Create program instance
const program = new Command();

program
  .name('mongodb-erd')
  .description('Generate Entity Relationship Diagrams from MongoDB databases')
  .version('1.0.0')
  .option('-u, --uri <uri>', 'MongoDB connection URI', process.env.MONGODB_URI)
  .option('-d, --database <n>', 'Database name')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <type>', 'Output format (svg, png, pdf)', 'svg')
  .option('--theme <theme>', 'Mermaid theme (default, dark, forest)', 'default')
  .option('--include <collections>', 'Comma-separated list of collections to include')
  .option('--exclude <collections>', 'Comma-separated list of collections to exclude')
  .action(async (options) => {
    try {
      if (!options.uri) {
        console.error('Error: MongoDB URI is required. Provide it via --uri or MONGODB_URI environment variable.');
        process.exit(1);
      }

      if (!options.database) {
        console.error('Error: Database name is required. Provide it via --database option.');
        process.exit(1);
      }

      // Generate timestamp for default output path
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')  // Replace colons and dots with hyphens
        .replace('T', '_')      // Replace T with underscore
        .replace('Z', '');      // Remove Z

      // Create ERD options
      const erdOptions = {
        uri: options.uri,
        database: options.database,
        format: options.format,
        theme: options.theme,
        outputPath: options.output || `erd_${timestamp}.${options.format}`,
        includeCollections: options.include ? options.include.split(',').map(c => c.trim()) : undefined,
        excludeCollections: options.exclude ? options.exclude.split(',').map(c => c.trim()) : undefined
      };

      const outputPath = await generateERD(erdOptions);
      console.log(`ERD generated successfully: ${outputPath}`);
    } catch (error) {
      console.error('Error generating ERD:', error.message);
      process.exit(1);
    }
  });

program.parse();