import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory path using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateMermaidDiagram(collectionMetadata, options = {}) {
  const {
    outputPath,
    format = 'svg',
    theme = 'default'
  } = options;

  if (!outputPath) {
    throw new Error('Output path is required');
  }

  // Create a temporary HTML file with the Mermaid diagram
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'mermaid-'));
  const htmlPath = path.join(tempDir, 'diagram.html');
  const mmdcPath = path.join(tempDir, 'diagram.mmd');

  // Generate Mermaid syntax
  const mermaidSyntax = generateMermaidSyntax(collectionMetadata, theme);

  // For Mermaid syntax output
  if (format.toLowerCase() === 'mermaid') {
    await fs.promises.writeFile(outputPath, mermaidSyntax);
    return outputPath;
  }

  // For ASCII output, we'll use a custom ASCII renderer
  if (format.toLowerCase() === 'ascii') {
    const asciiDiagram = generateAsciiDiagram(collectionMetadata);
    await fs.promises.writeFile(outputPath, asciiDiagram);
    return outputPath;
  }

  // For other formats, continue with the existing HTML-based approach
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>MongoDB ERD</title>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <style>
          body { margin: 0; padding: 20px; }
          .mermaid { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div class="mermaid">
          ${mermaidSyntax}
        </div>
        <script>
          mermaid.initialize({
            startOnLoad: true,
            theme: '${theme}',
            securityLevel: 'loose',
            flowchart: {
              curve: 'basis',
              padding: 20,
              nodeSpacing: 50,
              rankSpacing: 50,
              htmlLabels: true,
              defaultRenderer: 'elk'
            }
          });
        </script>
      </body>
    </html>
  `;

  await fs.promises.writeFile(htmlPath, html);

  try {
    // Launch browser with increased viewport size
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set a larger viewport size for higher resolution
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: false,
      isLandscape: true
    });

    // Load the HTML file
    await page.goto(`file:${htmlPath}`, {
      waitUntil: 'networkidle0'
    });

    // Wait for the diagram to be rendered
    await page.waitForSelector('.mermaid svg');

    // Get the SVG element
    const svgElement = await page.$('.mermaid svg');
    if (!svgElement) {
      throw new Error('SVG element not found');
    }

    // Generate output based on format
    switch (format.toLowerCase()) {
      case 'svg':
        await fs.promises.writeFile(outputPath, await page.evaluate(el => el.outerHTML, svgElement));
        break;
      case 'png':
        await page.screenshot({
          path: outputPath,
          type: 'png',
          fullPage: true,
          omitBackground: true
        });
        break;
      case 'pdf':
        await page.pdf({
          path: outputPath,
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
          }
        });
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    await browser.close();
  } finally {
    // Clean up temporary files
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

function generateAsciiDiagram(collectionMetadata) {
  let output = 'MongoDB ERD Diagram\n';
  output += '==================\n\n';

  // Calculate the maximum width needed for collection boxes
  const maxCollectionWidth = Math.max(
    ...collectionMetadata.map(c => c.name.length + 2)
  );

  // Draw collections and their relationships
  collectionMetadata.forEach((collection, index) => {
    // Draw collection box
    const boxWidth = maxCollectionWidth + 4;
    const boxHeight = 3;
    const boxTop = index * (boxHeight + 2);
    
    // Draw top of box
    output += ' ' + '─'.repeat(boxWidth) + '\n';
    // Draw collection name
    output += '│ ' + collection.name.padEnd(boxWidth - 2) + ' │\n';
    // Draw bottom of box
    output += ' ' + '─'.repeat(boxWidth) + '\n';

    // Draw fields
    collection.fields.forEach((field, fieldIndex) => {
      const fieldLine = `  ├─ ${field.name}: ${field.type}`;
      output += fieldLine + '\n';
    });

    // Draw relationships
    if (collection.relationships.length > 0) {
      output += '\n  Relationships:\n';
      collection.relationships.forEach(rel => {
        const targetIndex = collectionMetadata.findIndex(c => c.name === rel.to);
        if (targetIndex !== -1) {
          const targetBoxTop = targetIndex * (boxHeight + 2);
          const currentBoxTop = index * (boxHeight + 2);
          
          // Draw connection line
          if (targetIndex > index) {
            // Draw downward connection
            output += '  │\n';
            output += '  │\n';
            output += '  ▼\n';
          } else if (targetIndex < index) {
            // Draw upward connection
            output += '  ▲\n';
            output += '  │\n';
            output += '  │\n';
          }
          
          // Draw relationship label
          output += `  ${rel.field} → ${rel.to}\n`;
        }
      });
    }

    output += '\n';
  });

  // Add legend
  output += '\nLegend:\n';
  output += '──────\n';
  output += '  │   Collection\n';
  output += '  ├─  Field\n';
  output += '  →   Relationship\n';
  output += '  ▲   References above\n';
  output += '  ▼   References below\n';

  return output;
}

function generateMermaidSyntax(collectionMetadata, theme = 'default') {
  // Sanitize field names and types for Mermaid syntax
  function sanitizeFieldName(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  function sanitizeFieldType(type) {
    return type.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  let syntax = 'erDiagram\n';
  
  // Add theme configuration
  if (theme === 'dark') {
    syntax += `%%{init: {'theme': 'dark'}}%%\n`;
  }

  // Add collections
  collectionMetadata.forEach(collection => {
    const collectionName = sanitizeFieldName(collection.name);
    syntax += `    ${collectionName} {\n`;
    
    // Add fields
    collection.fields.forEach(field => {
      const fieldName = sanitizeFieldName(field.name);
      const fieldType = sanitizeFieldType(field.type);
      syntax += `        ${fieldType} ${fieldName}\n`;
    });
    
    syntax += '    }\n\n';
  });

  // Add relationships
  collectionMetadata.forEach(collection => {
    collection.relationships.forEach(rel => {
      const fromCollection = sanitizeFieldName(rel.from);
      const toCollection = sanitizeFieldName(rel.to);
      const fieldName = sanitizeFieldName(rel.field);
      syntax += `    ${fromCollection} ||--o{ ${toCollection} : "${fieldName}"\n`;
    });
  });

  return syntax;
}

function formatFieldType(field) {
  if (field.type === 'ObjectId') {
    return 'ObjectId';
  }
  return field.type;
}