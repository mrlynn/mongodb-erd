import { MongoClient, ObjectId } from 'mongodb';

export async function introspectDatabase(database, includeCollections = [], excludeCollections = []) {
  try {
    // Get all collections
    const collections = await database.listCollections().toArray();

    // Filter collections based on include/exclude options
    let filteredCollections = collections.map(col => col.name);
    if (includeCollections && includeCollections.length > 0) {
      filteredCollections = filteredCollections.filter(col => includeCollections.includes(col));
    }
    if (excludeCollections && excludeCollections.length > 0) {
      filteredCollections = filteredCollections.filter(col => !excludeCollections.includes(col));
    }

    // Analyze each collection
    const collectionMetadata = await Promise.all(
      filteredCollections.map(async (collectionName) => {
        const collection = database.collection(collectionName);
        const sampleDocs = await collection.find().limit(5).toArray();
        
        return {
          name: collectionName,
          fields: analyzeDocumentStructure(sampleDocs),
          relationships: [] // Initialize empty relationships array
        };
      })
    );

    return collectionMetadata;
  } catch (error) {
    console.error('Error introspecting database:', error);
    throw error;
  }
}

function analyzeDocumentStructure(doc, collectionName, processedDocs = new Set()) {
  if (!doc || typeof doc !== 'object') {
    return {
      fields: [],
      relationships: []
    };
  }

  // Prevent infinite recursion
  const docId = doc._id?.toString();
  if (docId && processedDocs.has(docId)) {
    return {
      fields: [],
      relationships: []
    };
  }
  if (docId) {
    processedDocs.add(docId);
  }

  const fields = new Map();
  const relationships = new Set();

  // Process each field in the document
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id') continue;

    const fieldType = determineFieldType(value);
    fields.set(key, { name: key, type: fieldType });

    // Check for relationships
    if (fieldType === 'ObjectId') {
      const referencedCollection = determineReferencedCollection(key);
      if (referencedCollection) {
        relationships.add({
          from: collectionName,
          to: referencedCollection,
          field: key
        });
      }
    } else if (fieldType === 'Array' && value.length > 0) {
      // Handle array fields
      if (typeof value[0] === 'object' && value[0] !== null) {
        // If array contains objects, analyze the first item
        const arrayItemStructure = analyzeDocumentStructure(value[0], collectionName, processedDocs);
        arrayItemStructure.fields.forEach((field, fieldKey) => {
          if (!fields.has(fieldKey)) {
            fields.set(fieldKey, field);
          }
        });
        arrayItemStructure.relationships.forEach(rel => relationships.add(rel));
      }
      // Keep the array type for the field itself
      fields.set(key, { name: key, type: 'Array' });
    } else if (fieldType === 'Object' && value !== null) {
      // Handle nested objects
      const nestedStructure = analyzeDocumentStructure(value, collectionName, processedDocs);
      nestedStructure.fields.forEach((field, fieldKey) => {
        if (!fields.has(fieldKey)) {
          fields.set(fieldKey, field);
        }
      });
      nestedStructure.relationships.forEach(rel => relationships.add(rel));
    }
  }

  return {
    fields: Array.from(fields.values()),
    relationships: Array.from(relationships)
  };
}

function determineFieldType(value) {
  if (value === null) return 'Null';
  if (Array.isArray(value)) return 'Array';
  if (typeof value === 'object') {
    if (value instanceof Date) return 'Date';
    if (value instanceof ObjectId) return 'ObjectId';
    if (value.$oid) return 'ObjectId';
    if (value.$date) return 'Date';
    return 'Object';
  }
  return typeof value;
}

function determineReferencedCollection(fieldName) {
  // Common patterns for referenced collections
  const patterns = [
    /^(\w+)_id$/i,           // user_id, post_id, etc.
    /^(\w+)Id$/i,           // userId, postId, etc.
    /^(\w+)Ref$/i,          // userRef, postRef, etc.
    /^(\w+)Reference$/i,    // userReference, postReference, etc.
    /^(\w+)$/i              // user, post, etc.
  ];

  for (const pattern of patterns) {
    const match = fieldName.match(pattern);
    if (match) {
      const collectionName = match[1].toLowerCase();
      // Add common plural forms
      return collectionName.endsWith('s') ? collectionName : `${collectionName}s`;
    }
  }

  return null;
}