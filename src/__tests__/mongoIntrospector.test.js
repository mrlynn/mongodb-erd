import { jest } from '@jest/globals';
import { MongoClient } from 'mongodb';
import { introspectDatabase } from '../lib/mongoIntrospector.js';

// Mock MongoDB client
jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    close: jest.fn(),
    db: jest.fn().mockReturnValue({
      listCollections: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { name: 'users' },
          { name: 'posts' }
        ])
      }),
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([{}])
          })
        })
      })
    })
  }))
}));

describe('mongoIntrospector', () => {
  it('should filter collections based on include option', async () => {
    const metadata = await introspectDatabase('mongodb://localhost:27017', 'test_db', {
      include: ['users']
    });
    
    // Just verify we get an array back with one item
    expect(Array.isArray(metadata)).toBe(true);
    expect(metadata.length).toBe(1);
  });
}); 