import { MongoClient } from 'mongodb';

export async function listDatabases(uri) {
  const client = await MongoClient.connect(uri);
  try {
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    return dbs.databases.map(db => db.name);
  } finally {
    await client.close();
  }
}

export async function listCollections(uri, database) {
  const client = await MongoClient.connect(uri);
  try {
    const db = client.db(database);
    const collections = await db.listCollections().toArray();
    return collections.map(c => c.name);
  } finally {
    await client.close();
  }
}

export async function analyzeDatabase(uri, database, collections = []) {
  const client = await MongoClient.connect(uri);
  try {
    const db = client.db(database);
    
    // If no collections specified, get all collections
    if (collections.length === 0) {
      const allCollections = await db.listCollections().toArray();
      collections = allCollections.map(c => c.name);
    }

    const analyzedCollections = [];
    const relationships = [];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const sampleDocs = await collection.find().limit(10).toArray();
      
      if (sampleDocs.length === 0) {
        analyzedCollections.push({
          name: collectionName,
          fields: []
        });
        continue;
      }

      const fields = [];
      const fieldTypes = new Map();

      // Analyze each document to build field types
      for (const doc of sampleDocs) {
        analyzeDocumentStructure(doc, '', fields, fieldTypes);
      }

      // Convert field types map to array
      const analyzedFields = Array.from(fieldTypes.entries()).map(([name, type]) => ({
        name,
        type,
        isArray: type.startsWith('Array<'),
        isObject: type.startsWith('Object<'),
        isReference: type === 'ObjectId'
      }));

      analyzedCollections.push({
        name: collectionName,
        fields: analyzedFields
      });

      // Find relationships
      for (const field of analyzedFields) {
        if (field.type === 'ObjectId') {
          // Try to determine the referenced collection
          const referencedCollection = await findReferencedCollection(db, field.name, sampleDocs);
          if (referencedCollection) {
            relationships.push({
              from: collectionName,
              to: referencedCollection,
              field: field.name,
              type: 'one-to-many'
            });
          }
        }
      }
    }

    return {
      collections: analyzedCollections,
      relationships
    };
  } finally {
    await client.close();
  }
}

function analyzeDocumentStructure(doc, prefix, fields, fieldTypes) {
  for (const [key, value] of Object.entries(doc)) {
    const fieldName = prefix ? `${prefix}.${key}` : key;
    
    if (value === null) {
      fieldTypes.set(fieldName, 'null');
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        fieldTypes.set(fieldName, 'Array<unknown>');
      } else {
        const itemType = typeof value[0];
        if (itemType === 'object' && value[0] !== null) {
          fieldTypes.set(fieldName, `Array<Object<${Object.keys(value[0]).join(',')}>>`);
          analyzeDocumentStructure(value[0], fieldName, fields, fieldTypes);
        } else {
          fieldTypes.set(fieldName, `Array<${itemType}>`);
        }
      }
      continue;
    }

    if (typeof value === 'object') {
      fieldTypes.set(fieldName, `Object<${Object.keys(value).join(',')}>`);
      analyzeDocumentStructure(value, fieldName, fields, fieldTypes);
      continue;
    }

    fieldTypes.set(fieldName, typeof value);
  }
}

async function findReferencedCollection(db, fieldName, sampleDocs) {
  // Get all collection names
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  // Check each document for the field
  for (const doc of sampleDocs) {
    const fieldValue = doc[fieldName];
    if (!fieldValue) continue;

    // If it's an array of ObjectIds, check the first one
    const valueToCheck = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
    if (!valueToCheck) continue;

    // Try to find a document in any collection that has this _id
    for (const collectionName of collectionNames) {
      const collection = db.collection(collectionName);
      const referencedDoc = await collection.findOne({ _id: valueToCheck });
      if (referencedDoc) {
        return collectionName;
      }
    }
  }

  return null;
}