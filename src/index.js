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
    database: databaseName,
    outputPath,
    format = 'svg',
    theme = 'default',
    includeCollections,
    excludeCollections
  } = options;

  if (!outputPath) {
    throw new Error('Output path is required');
  }

  let client = null;
  try {
    // Connect to MongoDB
    client = await MongoClient.connect(uri);
    console.log('Connected to MongoDB');

    // Get database
    const database = client.db(databaseName);

    // Introspect database
    const collectionMetadata = await introspectDatabase(database, {
      includeCollections,
      excludeCollections
    });

    // Generate diagram with the correct output path
    await generateMermaidDiagram(collectionMetadata, {
      outputPath,
      format,
      theme
    });

    return outputPath;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export { 
  introspectDatabase,
  generateMermaidDiagram
};