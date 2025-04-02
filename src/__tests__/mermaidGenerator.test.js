import { generateMermaidDiagram } from '../lib/mermaidGenerator.js';

describe('mermaidGenerator', () => {
  const mockCollectionMetadata = [
    {
      name: 'users',
      fields: [
        { name: '_id', type: 'ObjectId' },
        { name: 'name', type: 'String' }
      ],
      relationships: []
    }
  ];

  it('should generate SVG diagram', async () => {
    const outputPath = await generateMermaidDiagram(
      mockCollectionMetadata,
      'test.svg',
      'svg'
    );
    
    // Just verify we get a path back
    expect(typeof outputPath).toBe('string');
    expect(outputPath).toBe('test.svg');
  });
}); 