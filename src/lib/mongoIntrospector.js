import { MongoClient, ObjectId } from 'mongodb';

export async function introspectDatabase(database, options = {}) {
  const {
    includeCollections,
    excludeCollections
  } = options;

  try {
    // Get all collections
    const collections = await database.listCollections().toArray();
    
    // Filter collections based on include/exclude options
    let filteredCollections = collections.map(col => col.name);
    
    if (includeCollections && includeCollections.length > 0) {
      filteredCollections = filteredCollections.filter(name => 
        includeCollections.includes(name)
      );
    }
    
    if (excludeCollections && excludeCollections.length > 0) {
      filteredCollections = filteredCollections.filter(name => 
        !excludeCollections.includes(name)
      );
    }

    // Get metadata for each collection
    const collectionMetadata = await Promise.all(
      filteredCollections.map(async (collectionName) => {
        const collection = database.collection(collectionName);
        
        // Get sample document to analyze structure
        const sampleDoc = await collection.findOne();
        
        // Get collection stats using the correct method
        const stats = await database.command({ collStats: collectionName });
        
        // Analyze document structure and relationships
        const { fields, relationships } = sampleDoc ? analyzeDocumentStructure(sampleDoc, collectionName) : { fields: [], relationships: [] };
        
        return {
          name: collectionName,
          fields,
          relationships,
          documentCount: stats.count || 0,
          size: stats.size || 0,
          avgDocumentSize: stats.avgObjSize || 0
        };
      })
    );

    return collectionMetadata;
  } catch (error) {
    console.error('Error introspecting database:', error);
    throw error;
  }
}

function analyzeDocumentStructure(doc, collectionName, prefix = '') {
  const fields = [];
  const relationships = [];
  
  for (const [key, value] of Object.entries(doc)) {
    const fieldName = prefix ? `${prefix}.${key}` : key;
    const fieldType = typeof value;
    
    if (value === null) {
      fields.push({
        name: fieldName,
        type: 'null',
        required: false
      });
    } else if (Array.isArray(value)) {
      const arrayAnalysis = analyzeDocumentStructure(value[0], collectionName, fieldName);
      fields.push({
        name: fieldName,
        type: 'array',
        required: false,
        items: arrayAnalysis.fields
      });
      relationships.push(...arrayAnalysis.relationships);
    } else if (value instanceof ObjectId) {
      fields.push({
        name: fieldName,
        type: 'ObjectId',
        required: false
      });
      // Try to determine the referenced collection from the field name
      const referencedCollection = determineReferencedCollection(fieldName);
      if (referencedCollection) {
        relationships.push({
          from: collectionName,
          to: referencedCollection,
          field: fieldName,
          type: 'reference'
        });
      }
    } else if (typeof value === 'object') {
      const objectAnalysis = analyzeDocumentStructure(value, collectionName, fieldName);
      fields.push({
        name: fieldName,
        type: 'object',
        required: false,
        fields: objectAnalysis.fields
      });
      relationships.push(...objectAnalysis.relationships);
    } else {
      fields.push({
        name: fieldName,
        type: fieldType,
        required: false
      });
    }
  }
  
  return { fields, relationships };
}

function determineReferencedCollection(fieldName) {
  // Common patterns for field names that reference other collections
  const patterns = {
    userId: 'users',
    user_id: 'users',
    authorId: 'users',
    author_id: 'users',
    movieId: 'movies',
    movie_id: 'movies',
    commentId: 'comments',
    comment_id: 'comments',
    postId: 'posts',
    post_id: 'posts',
    categoryId: 'categories',
    category_id: 'categories',
    productId: 'products',
    product_id: 'products'
  };

  // Check if the field name matches any of our patterns
  for (const [pattern, collection] of Object.entries(patterns)) {
    if (fieldName.toLowerCase().includes(pattern.toLowerCase())) {
      return collection;
    }
  }

  return null;
}