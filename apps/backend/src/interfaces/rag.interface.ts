import { Document, ScoredDocument } from "./document.interface";

export interface QueryRequest {
  query: string;
  topK?: number;
}

export interface QueryResponse {
  documents: ScoredDocument[];
}

export interface GenerateRequest {
  query: string;
  retrievedDocs: Document[];
  generationParams?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface GenerateResponse {
  answer: string;
  sourceDocuments: string[];
}

export interface StatusResponse {
  uptime: string;
  status: string;
  lastIndexed?: string;
}
