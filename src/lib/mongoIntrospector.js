import { MongoClient, ObjectId } from 'mongodb';

export async function introspectDatabase(uri, dbName, options = {}) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    let collections = await db.listCollections().toArray();

    // Apply collection filtering
    if (options.include) {
      collections = collections.filter(col => options.include.includes(col.name));
    } else if (options.exclude) {
      collections = collections.filter(col => !options.exclude.includes(col.name));
    }

    const metadata = [];

    for (const collection of collections) {
      const collectionName = collection.name;
      const sampleDocs = await db.collection(collectionName)
        .find()
        .limit(10)
        .toArray();

      const fields = new Map();
      const relationships = new Set();

      for (const doc of sampleDocs) {
        for (const [key, value] of Object.entries(doc)) {
          if (!fields.has(key)) {
            fields.set(key, {
              name: key,
              type: typeof value,
              isReference: false
            });
          }

          // Check for ObjectId references
          if (value instanceof ObjectId) {
            fields.get(key).isReference = true;
            relationships.add(key);
          }
        }
      }

      metadata.push({
        name: collectionName,
        fields: Array.from(fields.values()),
        relationships: Array.from(relationships).map(field => ({
          target: field,
          field,
          type: 'reference'
        }))
      });
    }

    return metadata;
  } finally {
    await client.close();
  }
}