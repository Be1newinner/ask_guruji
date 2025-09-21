import "dotenv/config";

export const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const COLLECTION_NAME = process.env.COLLECTION_NAME || "documents";
export const EMBEDDING_SIZE = 768;
