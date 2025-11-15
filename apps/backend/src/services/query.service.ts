import {
  QueryRequest,
  QueryResponse,
  GenerateRequest,
  GenerateResponse,
} from "../interfaces/rag.interface";
import { vectorDB } from "../features/vector_db";

export interface QueryService {
  retrieveDocuments(request: QueryRequest): Promise<QueryResponse>;
  generateAnswer(request: GenerateRequest): Promise<GenerateResponse>;
}

export const retrieveDocumentsService = async (
  request: QueryRequest
): Promise<QueryResponse> => {
  return vectorDB.retrieveDocuments(request);
};

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
