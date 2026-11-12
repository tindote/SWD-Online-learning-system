const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const getGeminiConfig = () => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const chatModel = (process.env.GEMINI_CHAT_MODEL || 'gemini-3.6-flash').trim();
  const embeddingModel = (process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001').trim();
  const embeddingDimension = parseInt(process.env.GEMINI_EMBEDDING_DIMENSION || '768', 10) || 768;

  const chunkSize = parseInt(process.env.RAG_CHUNK_SIZE || '1200', 10) || 1200;
  const chunkOverlap = parseInt(process.env.RAG_CHUNK_OVERLAP || '200', 10) || 200;
  const topK = parseInt(process.env.RAG_TOP_K || '5', 10) || 5;
  const maxHistoryMessages = parseInt(process.env.AI_MAX_HISTORY_MESSAGES || '8', 10) || 8;
  const maxMessageLength = parseInt(process.env.AI_MAX_MESSAGE_LENGTH || '2000', 10) || 2000;

  return {
    apiKey,
    chatModel,
    embeddingModel,
    embeddingDimension,
    chunkSize,
    chunkOverlap,
    topK,
    maxHistoryMessages,
    maxMessageLength
  };
};

let cachedClient = null;
let cachedApiKey = null;

/**
 * Returns an initialized GoogleGenAI SDK client.
 * Throws a clear error if GEMINI_API_KEY is missing or invalid placeholder.
 */
const getGeminiClient = () => {
  const { apiKey } = getGeminiConfig();

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const err = new Error('Dịch vụ AI chưa được cấu hình khóa GEMINI_API_KEY hợp lệ trên máy chủ.');
    err.code = 'GEMINI_API_KEY_MISSING';
    err.statusCode = 503;
    throw err;
  }

  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }

  return cachedClient;
};

module.exports = {
  getGeminiConfig,
  getGeminiClient
};

