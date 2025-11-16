/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @fileoverview This file contains the interfaces for document-related objects.
 * It defines the structure of documents, ingest requests, and responses.
 */

/**
 * Interface for a document.
 */
export interface Document {
  /**
   * The unique identifier of the document.
   */
  id?: string;
  /**
   * The content of the document.
   */
  content: string;
  /**
   * The metadata of the document.
   */
  metadata?: { [key: string]: any };
}

/**
 * Interface for an ingest request.
 */
export interface IngestRequest {
  /**
   * An array of documents to ingest.
   */
  documents: Document[];
}

/**
 * Interface for an ingest response.
 */
export interface IngestResponse {
  /**
   * The number of documents that were successfully ingested.
   */
  ingestedCount: number;
  /**
   * An array of error messages for documents that failed to ingest.
   */
  errors: string[];
}

/**
 * Interface for a get document response.
 */
export interface GetDocumentResponse {
  /**
   * The unique identifier of the document.
   */
  id?: string;
  /**
   * The content of the document.
   */
  content: string;
  /**
   * The metadata of the document.
   */
  metadata?: { [key: string]: any };
}

/**
 * Interface for a delete document response.
 */
export interface DeleteDocumentResponse {
  /**
   * Whether the document was successfully deleted.
   */
  deleted: boolean;
  /**
   * A message indicating the result of the delete operation.
   */
  message: string;
}

/**
 * Interface for a scored document.
 */
export interface ScoredDocument extends Document {
  /**
   * The score of the document, indicating its relevance to a query.
   */
  score: number;
}
