const crypto = require('crypto');
const GeminiService = require('./geminiService');

const EmbeddingService = {
  /**
   * Computes a SHA-256 hash of normalized text content to detect unchanged chunks
   * and avoid redundant embedding API calls.
   */
  computeContentHash: (text) => {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
  },

  /**
   * Validates that an embedding vector is a non-empty array of finite numbers.
   */
  isValidVector: (vector) => {
    if (!Array.isArray(vector) || vector.length === 0) return false;
    for (let i = 0; i < vector.length; i++) {
      const val = vector[i];
      if (typeof val !== 'number' || !Number.isFinite(val)) {
        return false;
      }
    }
    return true;
  },

  /**
   * Generates an embedding vector for a document chunk.
   */
  generateDocumentEmbedding: async (chunkText) => {
    const vector = await GeminiService.generateEmbedding(chunkText, 'RETRIEVAL_DOCUMENT');
    if (!EmbeddingService.isValidVector(vector)) {
      const err = new Error('Vector embedding của tài liệu không hợp lệ.');
      err.code = 'INVALID_EMBEDDING_VECTOR';
      err.statusCode = 502;
      throw err;
    }
    return vector;
  },

  /**
   * Generates an embedding vector for a student query.
   */
  generateQueryEmbedding: async (queryText) => {
    const vector = await GeminiService.generateEmbedding(queryText, 'RETRIEVAL_QUERY');
    if (!EmbeddingService.isValidVector(vector)) {
      const err = new Error('Vector embedding của câu hỏi không hợp lệ.');
      err.code = 'INVALID_EMBEDDING_VECTOR';
      err.statusCode = 502;
      throw err;
    }
    return vector;
  }
};

module.exports = EmbeddingService;

