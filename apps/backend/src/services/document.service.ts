import {
  IngestRequest,
  IngestResponse,
  GetDocumentResponse,
  DeleteDocumentResponse,
} from "../interfaces/document.interface";
import { vectorDB } from "../features/vector_db";

export interface DocumentService {
  ingestDocuments(request: IngestRequest): Promise<IngestResponse>;
  getDocumentById(id: string): Promise<GetDocumentResponse | null>;
  deleteDocumentById(id: string): Promise<DeleteDocumentResponse>;
}

export const ingestDocumentsService = async (
  request: IngestRequest
): Promise<IngestResponse> => {
  return vectorDB.addDocumentsBulk(request.documents);
};

export const getDocumentByIdService = async (
  id: string
): Promise<GetDocumentResponse | null> => {
  return vectorDB.getDocumentById(id);
};

export const deleteDocumentByIdService = async (
  id: string
): Promise<DeleteDocumentResponse> => {
  return vectorDB.deleteDocumentById(id);
};
