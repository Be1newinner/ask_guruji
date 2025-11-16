/**
 * @fileoverview This file contains the configuration variables for the application.
 * It loads environment variables and defines constants used throughout the application.
 */
import "dotenv/config";
import path from "path";

/**
 * The absolute path to the source directory.
 */
export const SRC_DIR = path.resolve(import.meta.dirname, "..");

/**
 * The URL of the Qdrant vector database.
 * Defaults to "http://localhost:6333" if not specified in the environment variables.
 */
export const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";

/**
 * The API key for the Gemini API.
 */
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * The name of the collection in the Qdrant vector database.
 * Defaults to "documents" if not specified in the environment variables.
 */
export const COLLECTION_NAME = process.env.COLLECTION_NAME || "documents";

/**
 * The size of the embeddings used for the documents.
 */
export const EMBEDDING_SIZE = 3072;

/**
 * The API key for the Qdrant vector database.
 */
export const qdrantKey = process.env.QDRANT_KEY;
