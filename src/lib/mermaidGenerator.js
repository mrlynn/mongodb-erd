import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function generateMermaidDiagram(collectionMetadata, outputPath, format = 'svg', options = {}) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-'));
  const tempHtmlPath = path.join(tempDir, 'diagram.html');
  const theme = options.theme || 'default';

  let browser = null;
  try {
    // Generate Mermaid syntax
    const mermaidSyntax = generateMermaidSyntax(collectionMetadata, theme);

    // Create HTML file with Mermaid
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
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
              themeVariables: {
                fontFamily: 'monospace',
                fontSize: '14px',
                primaryColor: '#1a73e8',
                primaryTextColor: '#202124',
                primaryBorderColor: '#dadce0',
                lineColor: '#dadce0',
                secondaryColor: '#f8f9fa',
                tertiaryColor: '#f8f9fa'
              }
            });
          </script>
        </body>
      </html>
    `;

    fs.writeFileSync(tempHtmlPath, htmlContent);

    // Launch browser and generate diagram
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file:${tempHtmlPath}`);
    await page.waitForSelector('.mermaid svg');

    if (format === 'svg') {
      const svgContent = await page.$eval('.mermaid svg', el => el.outerHTML);
      fs.writeFileSync(outputPath, svgContent);
    } else {
      const element = await page.$('.mermaid');
      const box = await element.boundingBox();
      await page.setViewport({
        width: Math.ceil(box.width),
        height: Math.ceil(box.height)
      });

      if (format === 'png') {
        await page.screenshot({
          path: outputPath,
          type: 'png'
        });
      } else if (format === 'pdf') {
        await page.pdf({
          path: outputPath,
          width: box.width,
          height: box.height
        });
      }
    }

    await page.close();
    await browser.close();
    return outputPath;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`Failed to generate diagram: ${error.message}`);
  } finally {
    try {
      fs.unlinkSync(tempHtmlPath);
    } catch (error) {
      // Ignore cleanup errors
    }
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
    for (const relationship of collection.relationships) {
      const relKey = `${collection.name}-${relationship.target}`;
      if (!relationships.has(relKey)) {
        relationships.add(relKey);
        syntax += `    ${collection.name} ||--o{ ${relationship.target} : "${relationship.type}"\n`;
      }
    }
  }

  return syntax;
}

function formatFieldType(field) {
  if (field.isReference) {
    return 'ObjectId';
  }
  return field.type;
}