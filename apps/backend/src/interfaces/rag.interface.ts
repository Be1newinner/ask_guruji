/**
 * @fileoverview This file contains the interfaces for the RAG (Retrieval-Augmented Generation) system.
 * It defines the structure of query requests, responses, and generation parameters.
 */
import { Document, ScoredDocument } from "./document.interface";

/**
 * Interface for a query request.
 */
export interface QueryRequest {
  /**
   * The query string.
   */
  query: string;
  /**
   * The number of documents to retrieve.
   */
  topK?: number;
}

/**
 * Interface for a query response.
 */
export interface QueryResponse {
  /**
   * An array of scored documents that are relevant to the query.
   */
  documents: ScoredDocument[];
}

/**
 * Interface for a generate request.
 */
export interface GenerateRequest {
  /**
   * The query string.
   */
  query: string;
  /**
   * An array of documents to use as context for generating the answer.
   */
  retrievedDocs: Document[];
  /**
   * Optional parameters for the generation model.
   */
  generationParams?: {
    /**
     * The temperature to use for the generation model.
     */
    temperature?: number;
    /**
     * The maximum number of tokens to generate.
     */
    maxTokens?: number;
  };
}

/**
 * Interface for a generate response.
 */
export interface GenerateResponse {
  /**
   * The generated answer.
   */
  answer: string;
  /**
   * An array of the source documents that were used to generate the answer.
   */
  sourceDocuments: string[];
}

/**
 * Interface for a status response.
 */
export interface StatusResponse {
  /**
   * The uptime of the application.
   */
  uptime: string;
  /**
   * The status of the application.
   */
  status: string;
  /**
   * The timestamp of the last time a document was indexed.
   */
  lastIndexed?: string;
}
