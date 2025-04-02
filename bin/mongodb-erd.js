#!/usr/bin/env node

import { Command } from 'commander';
import { generateERD } from '../src/index.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
  .option('-o, --output <path>', 'Output file path', 'erd.svg')
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

      // Parse include/exclude collections if provided
      if (options.include) {
        options.includeCollections = options.include.split(',').map(c => c.trim());
      }
      if (options.exclude) {
        options.excludeCollections = options.exclude.split(',').map(c => c.trim());
      }

      await generateERD(options);
      console.log(`ERD generated successfully: ${options.output}`);
    } catch (error) {
      console.error('Error generating ERD:', error.message);
      process.exit(1);
    }
  });

program.parse();