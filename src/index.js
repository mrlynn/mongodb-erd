import { MongoClient } from 'mongodb';
import { analyzeDatabase } from './lib/mongoIntrospector.js';
import { generateMermaidDiagram } from './lib/mermaidGenerator.js';
import { writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateERD(options) {
  const {
    uri,
    database,
    outputPath,
    format = 'svg',
    theme = 'default',
    collections = [],
    excludeCollections = []
  } = options;

  // Check for URI in options or environment
  const finalUri = uri || process.env.MONGODB_URI;
  
  if (!finalUri) {
    throw new Error('MongoDB URI is required (use options.uri or MONGODB_URI environment variable)');
  }

  if (!finalUri.startsWith('mongodb://') && !finalUri.startsWith('mongodb+srv://')) {
    throw new Error('MongoDB URI format is invalid');
  }

  // Check for database in options or environment
  const finalDatabase = database || process.env.MONGODB_DATABASE;
  
  if (!finalDatabase) {
    throw new Error('Database name is required (use options.database or MONGODB_DATABASE environment variable)');
  }

  // Generate default output path if not provided
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = format === 'ascii' ? 'txt' : 
                   format === 'mermaid' ? 'mmd' : 
                   format;
  const defaultOutputPath = `erd_${timestamp}.${extension}`;
  const finalOutputPath = outputPath || defaultOutputPath;

  try {
    // Check if database exists
    const client = await MongoClient.connect(finalUri);
    try {
      const dbs = await client.db().admin().listDatabases();
      const dbExists = dbs.databases.some(db => db.name === finalDatabase);
      if (!dbExists) {
        throw new Error(`Database '${finalDatabase}' does not exist`);
      }
    } finally {
      await client.close();
    }

    // Analyze the database
    const { collections: analyzedCollections } = await analyzeDatabase(finalUri, finalDatabase, collections);

    // Generate the diagram
    const outputPath = await generateMermaidDiagram(analyzedCollections, {
      outputPath: finalOutputPath,
      format,
      theme
    });

    return outputPath;
  } catch (error) {
    // If it's already a database existence error, throw it directly
    if (error.message.includes("Database '") && error.message.includes("' does not exist")) {
      throw error;
    }
    // Otherwise wrap it in the ERD error message
    throw new Error(`Error generating ERD: ${error.message}`);
  }
}

export { 
  analyzeDatabase,
  generateMermaidDiagram
};