export interface Document {
  id?: string;
  content: string;
  metadata?: { [key: string]: any };
}

export interface IngestRequest {
  documents: Document[];
}

export interface IngestResponse {
  ingestedCount: number;
  errors: string[];
}

export interface GetDocumentResponse {
  id?: string;
  content: string;
  metadata?: { [key: string]: any };
}

export interface DeleteDocumentResponse {
  deleted: boolean;
  message: string;
}

export interface ScoredDocument extends Document {
  score: number;
}
