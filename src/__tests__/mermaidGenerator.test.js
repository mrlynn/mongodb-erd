import { generateMermaidDiagram } from '../lib/mermaidGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('mermaidGenerator', () => {
  const testOutputPath = path.join(__dirname, 'test-output.svg');
  const testCollections = [
    {
      name: 'users',
      fields: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' }
      ],
      relationships: []
    }
  ];

  afterEach(() => {
    if (fs.existsSync(testOutputPath)) {
      fs.unlinkSync(testOutputPath);
    }
  });

  it('should generate a diagram file', async () => {
    await generateMermaidDiagram(testCollections, {
      outputPath: testOutputPath,
      format: 'svg',
      theme: 'light'
    });
    expect(fs.existsSync(testOutputPath)).toBe(true);
  });
}); 