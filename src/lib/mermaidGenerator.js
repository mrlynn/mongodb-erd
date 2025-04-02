import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

  // Generate Mermaid syntax
  const mermaidSyntax = generateMermaidSyntax(collectionMetadata, theme);

  // Create HTML with Mermaid
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

function generateMermaidSyntax(collectionMetadata, theme) {
  const entities = new Set();
  const relationships = new Set();
  let syntax = 'erDiagram\n';

  // Add entities
  for (const collection of collectionMetadata) {
    const entityName = collection.name;
    entities.add(entityName);

    syntax += `    ${entityName} {\n`;
    for (const field of collection.fields) {
      const fieldType = formatFieldType(field);
      syntax += `        ${fieldType} ${field.name}\n`;
    }
    syntax += '    }\n\n';
  }

  // Add relationships
  for (const collection of collectionMetadata) {
    if (collection.relationships && Array.isArray(collection.relationships)) {
      for (const relationship of collection.relationships) {
        const relKey = `${relationship.from}-${relationship.to}`;
        if (!relationships.has(relKey)) {
          relationships.add(relKey);
          syntax += `    ${relationship.from} ||--o{ ${relationship.to} : "${relationship.field}"\n`;
        }
      }
    }
  }

  return syntax;
}

function formatFieldType(field) {
  if (field.type === 'ObjectId') {
    return 'ObjectId';
  }
  return field.type;
}