/**
 * @fileoverview This file contains the service functions for query-related operations.
 * It provides an interface for retrieving documents and generating answers.
 */
import {
  QueryRequest,
  QueryResponse,
  GenerateRequest,
  GenerateResponse,
} from "../interfaces/rag.interface";
import { vectorDB } from "../features/vector_db";

/**
 * Interface for the query service.
 */
export interface QueryService {
  /**
   * Retrieves documents based on a query.
   * @param request The query request, containing the query and the number of documents to retrieve.
   * @returns A promise that resolves to a query response, containing the retrieved documents.
   */
  retrieveDocuments(request: QueryRequest): Promise<QueryResponse>;

  /**
   * Generates an answer based on a query and a set of retrieved documents.
   * @param request The generate request, containing the query and the retrieved documents.
   * @returns A promise that resolves to a generate response, containing the generated answer and the source documents.
   */
  generateAnswer(request: GenerateRequest): Promise<GenerateResponse>;
}

/**
 * Service for retrieving documents.
 * @param request The query request, containing the query and the number of documents to retrieve.
 * @returns A promise that resolves to a query response, containing the retrieved documents.
 */
export const retrieveDocumentsService = async (
  request: QueryRequest
): Promise<QueryResponse> => {
  return vectorDB.retrieveDocuments(request);
};

/**
 * Service for generating an answer.
 * @param request The generate request, containing the query and the retrieved documents.
 * @returns A promise that resolves to a generate response, containing the generated answer and the source documents.
 */
export const generateAnswerService = async (
  request: GenerateRequest
): Promise<GenerateResponse> => {
  const { query, retrievedDocs } = request;
  const answer = await vectorDB.queryRag(query);
  const sourceDocuments = retrievedDocs
    .map((doc) => doc.id || "")
    .filter((id) => id !== "");
  return { answer, sourceDocuments };
};
