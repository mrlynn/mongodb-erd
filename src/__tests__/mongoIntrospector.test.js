import { introspectDatabase } from '../lib/mongoIntrospector.js';

describe('mongoIntrospector', () => {
  const mockDatabase = {
    listCollections: () => ({
      toArray: () => Promise.resolve([
        { name: 'users' },
        { name: 'posts' }
      ])
    }),
    collection: () => ({
      find: () => ({
        limit: () => ({
          toArray: () => Promise.resolve([
            {
              _id: '123',
              name: 'Test User',
              email: 'test@example.com'
            }
          ])
        })
      })
    })
  };

  it('should return collection metadata', async () => {
    const result = await introspectDatabase(mockDatabase);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('fields');
  });
}); 