import { MongoClient } from 'mongodb';
import { introspectDatabase } from './lib/mongoIntrospector.js';
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

  if (!uri) {
    throw new Error('MongoDB URI is required');
  }

  if (!database) {
    throw new Error('Database name is required');
  }

  // Generate default output path if not provided
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = format === 'ascii' ? 'txt' : 
                   format === 'mermaid' ? 'mmd' : 
                   format;
  const defaultOutputPath = `erd_${timestamp}.${extension}`;
  const finalOutputPath = outputPath || defaultOutputPath;

  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(uri);
    const db = client.db(database);

    // Introspect the database
    const collectionMetadata = await introspectDatabase(db, collections, excludeCollections);

    // Generate the diagram
    const outputPath = await generateMermaidDiagram(collectionMetadata, {
      outputPath: finalOutputPath,
      format,
      theme
    });

    await client.close();
    return outputPath;
  } catch (error) {
    throw new Error(`Error generating ERD: ${error.message}`);
  }
}

export { 
  introspectDatabase,
  generateMermaidDiagram
};