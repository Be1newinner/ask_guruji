/**
 * @fileoverview This file contains the service functions for document-related operations.
 * It provides an interface for ingesting, retrieving, and deleting documents.
 */
import {
  IngestRequest,
  IngestResponse,
  GetDocumentResponse,
  DeleteDocumentResponse,
} from "../interfaces/document.interface";
import { vectorDB } from "../features/vector_db";

/**
 * Interface for the document service.
 */
export interface DocumentService {
  /**
   * Ingests documents into the vector database.
   * @param request The ingest request, containing the documents to ingest.
   * @returns A promise that resolves to an ingest response.
   */
  ingestDocuments(request: IngestRequest): Promise<IngestResponse>;

  /**
   * Gets a document by its ID.
   * @param id The ID of the document to get.
   * @returns A promise that resolves to the document, or null if it is not found.
   */
  getDocumentById(id: string): Promise<GetDocumentResponse | null>;

  /**
   * Deletes a document by its ID.
   * @param id The ID of the document to delete.
   * @returns A promise that resolves to a delete response.
   */
  deleteDocumentById(id: string): Promise<DeleteDocumentResponse>;
}

/**
 * Service for ingesting documents.
 * @param request The ingest request, containing the documents to ingest.
 * @returns A promise that resolves to an ingest response.
 */
export const ingestDocumentsService = async (
  request: IngestRequest
): Promise<IngestResponse> => {
  return vectorDB.addDocumentsBulk(request.documents);
};

/**
 * Service for getting a document by its ID.
 * @param id The ID of the document to get.
 * @returns A promise that resolves to the document, or null if it is not found.
 */
export const getDocumentByIdService = async (
  id: string
): Promise<GetDocumentResponse | null> => {
  return vectorDB.getDocumentById(id);
};

/**
 * Service for deleting a document by its ID.
 * @param id The ID of the document to delete.
 * @returns A promise that resolves to a delete response.
 */
export const deleteDocumentByIdService = async (
  id: string
): Promise<DeleteDocumentResponse> => {
  return vectorDB.deleteDocumentById(id);
};
