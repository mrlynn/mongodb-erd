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
          body { margin: 0; padding: 20px; background: white; }
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
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    // Wait for the diagram to be rendered
    await page.waitForSelector('.mermaid svg');

    if (format.toLowerCase() === 'png') {
      // For PNG output, take a screenshot of the SVG
      const element = await page.$('.mermaid svg');
      await element.screenshot({
        path: outputPath,
        type: 'png',
        omitBackground: true
      });
    } else {
      // For SVG output, get the SVG content
      const svg = await page.evaluate(() => {
        const svgElement = document.querySelector('.mermaid svg');
        return svgElement.outerHTML;
      });

      // Write the SVG to the output file
      await fs.promises.writeFile(outputPath, svg);
    }

    await browser.close();

    // Clean up temporary files
    await fs.promises.rm(tempDir, { recursive: true, force: true });

    return outputPath;
  } catch (error) {
    console.error('Error generating diagram:', error);
    throw error;
  }
}

function generateAsciiDiagram(collections) {
  let output = '';

  // Add collections
  collections.forEach(collection => {
    output += `[${collection.name}]\n`;
    collection.fields.forEach(field => {
      output += `  ${field.name}: ${field.type}\n`;
    });
    output += '\n';
  });

  return output;
}

function generateMermaidSyntax(collections, theme = 'default') {
  let syntax = 'erDiagram\n';

  // Add collections
  collections.forEach(collection => {
    syntax += `    ${collection.name} {\n`;
    collection.fields.forEach(field => {
      // Format field type for Mermaid ERD
      const fieldType = formatFieldType(field);
      // Escape special characters in field name
      const fieldName = field.name.replace(/[^a-zA-Z0-9_]/g, '_');
      syntax += `        ${fieldType} ${fieldName}\n`;
    });
    syntax += '    }\n\n';
  });

  return syntax;
}

function formatFieldType(field) {
  // Map MongoDB types to Mermaid ERD types
  const typeMap = {
    'string': 'STRING',
    'number': 'NUMBER',
    'boolean': 'BOOLEAN',
    'date': 'DATE',
    'ObjectId': 'STRING',
    'Array': 'ARRAY',
    'Object': 'OBJECT',
    'null': 'NULL'
  };

  // Get base type (remove Array<> or Object<> wrapper)
  const baseType = field.type.replace(/^(Array|Object)<(.+)>$/, '$2');
  
  // Map to Mermaid type or default to STRING
  return typeMap[baseType] || 'STRING';
}