import { introspectDatabase } from './lib/mongoIntrospector.js';
import { generateMermaidDiagram } from './lib/mermaidGenerator.js';
import { writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateERD({ 
  uri, 
  database, 
  output = 'erd.svg', 
  format = 'svg', 
  theme = 'default',
  includeCollections,
  excludeCollections
}) {
  try {
    // Connect and introspect database
    const metadata = await introspectDatabase(uri, database, {
      includeCollections,
      excludeCollections
    });
    
    // Generate diagram using mermaid
    const outputPath = await generateMermaidDiagram(metadata, output, format, theme);
    
    return {
      success: true,
      output: outputPath,
      metadata
    };
  } catch (error) {
    throw new Error(`Failed to generate ERD: ${error.message}`);
  }
}

export { 
  generateERD,
  introspectDatabase,
  generateMermaidDiagram
};