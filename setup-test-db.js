import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'test_db';

async function setupTestDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Clear existing collections
    await db.collections().then(collections => 
      Promise.all(collections.map(collection => collection.drop()))
    );
    
    // Create users collection
    const users = await db.createCollection('users');
    await users.insertMany([
      {
        _id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        posts: ['post1', 'post2']
      },
      {
        _id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        createdAt: new Date(),
        posts: ['post3']
      }
    ]);
    
    // Create posts collection
    const posts = await db.createCollection('posts');
    await posts.insertMany([
      {
        _id: 'post1',
        title: 'First Post',
        content: 'This is the first post',
        author: 'user1',
        createdAt: new Date(),
        comments: ['comment1', 'comment2']
      },
      {
        _id: 'post2',
        title: 'Second Post',
        content: 'This is the second post',
        author: 'user1',
        createdAt: new Date(),
        comments: ['comment3']
      },
      {
        _id: 'post3',
        title: 'Third Post',
        content: 'This is the third post',
        author: 'user2',
        createdAt: new Date(),
        comments: []
      }
    ]);
    
    // Create comments collection
    const comments = await db.createCollection('comments');
    await comments.insertMany([
      {
        _id: 'comment1',
        content: 'Great post!',
        author: 'user2',
        post: 'post1',
        createdAt: new Date()
      },
      {
        _id: 'comment2',
        content: 'Thanks for sharing',
        author: 'user1',
        post: 'post1',
        createdAt: new Date()
      },
      {
        _id: 'comment3',
        content: 'Interesting perspective',
        author: 'user2',
        post: 'post2',
        createdAt: new Date()
      }
    ]);
    
    console.log('Test database setup completed successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
  } finally {
    await client.close();
  }
}

setupTestDatabase(); 