#!/usr/bin/env node

import { Command } from 'commander';
import { generateERD } from '../src/index.js';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import { MongoClient } from 'mongodb';

// Initialize dotenv
dotenv.config();

// Create program instance
const program = new Command();

async function listDatabases(uri) {
  const client = await MongoClient.connect(uri);
  try {
    const adminDb = client.db('admin');
    const result = await adminDb.command({ listDatabases: 1 });
    return result.databases.map(db => db.name);
  } finally {
    await client.close();
  }
}

async function listCollections(uri, database) {
  const client = await MongoClient.connect(uri);
  try {
    const db = client.db(database);
    const collections = await db.listCollections().toArray();
    return collections.map(col => col.name);
  } finally {
    await client.close();
  }
}

program
  .name('mongodb-erd')
  .description('Generate Entity Relationship Diagrams from MongoDB databases')
  .version('1.0.0')
  .option('-u, --uri <uri>', 'MongoDB connection URI', process.env.MONGODB_URI)
  .option('-d, --database <n>', 'Database name')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format (svg, png, pdf, ascii, mermaid)', 'svg')
  .option('-t, --theme <theme>', 'Theme (light, dark)', 'light')
  .option('-c, --collections <collections...>', 'Collections to include')
  .option('-e, --exclude <collections...>', 'Collections to exclude')
  .action(async (options) => {
    try {
      if (!options.uri) {
        throw new Error('MongoDB URI is required');
      }

      if (!options.database) {
        // List available databases
        const databases = await listDatabases(options.uri);
        const { database } = await inquirer.prompt([
          {
            type: 'list',
            name: 'database',
            message: 'Select a database:',
            choices: databases
          }
        ]);
        options.database = database;
      }

      // List collections if not specified
      if (!options.collections || options.collections.length === 0) {
        const collections = await listCollections(options.uri, options.database);
        const { selectedCollections } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedCollections',
            message: 'Select collections to include (use space to select):',
            choices: ['ALL', ...collections],
            default: ['ALL']
          }
        ]);

        if (selectedCollections.includes('ALL')) {
          options.collections = collections;
        } else {
          options.collections = selectedCollections;
        }
      }

      // Set default output path based on format
      if (!options.output) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = options.format === 'ascii' ? 'txt' : 
                         options.format === 'mermaid' ? 'mmd' : 
                         options.format;
        options.output = `erd_${timestamp}.${extension}`;
      }

      console.log('Connected to MongoDB');
      await generateERD(options);
      console.log(`ERD generated successfully: ${options.output}`);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();