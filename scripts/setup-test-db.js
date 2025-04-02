import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'test_db';

async function setupTestDb() {
  const client = await MongoClient.connect(uri);
  try {
    const db = client.db(dbName);
    
    // Drop existing collections
    await db.collection('users').drop().catch(() => {});
    await db.collection('posts').drop().catch(() => {});
    await db.collection('comments').drop().catch(() => {});

    // Create users
    await db.collection('users').insertMany([
      { _id: 1, name: 'John Doe', email: 'john@example.com' },
      { _id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]);

    // Create posts
    await db.collection('posts').insertMany([
      { 
        _id: 1, 
        title: 'First Post',
        content: 'This is the first post',
        author_id: 1,
        created_at: new Date()
      },
      {
        _id: 2,
        title: 'Second Post',
        content: 'This is the second post',
        author_id: 2,
        created_at: new Date()
      }
    ]);

    // Create comments
    await db.collection('comments').insertMany([
      {
        _id: 1,
        content: 'Great post!',
        post_id: 1,
        user_id: 2,
        created_at: new Date()
      },
      {
        _id: 2,
        content: 'Thanks for sharing!',
        post_id: 2,
        user_id: 1,
        created_at: new Date()
      }
    ]);

    console.log('Test database setup complete!');
  } finally {
    await client.close();
  }
}

setupTestDb().catch(console.error); 