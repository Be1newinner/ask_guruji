import { QdrantClient } from "@qdrant/js-client-rest";
import { getCollectionInfo, setupCollection } from "./qdrantService";
import { COLLECTION_NAME, QDRANT_URL, qdrantKey } from "@/core/config";
import { queryRag } from "../rag/queryRag";
import {
  DeleteDocumentResponse,
  Document,
  GetDocumentResponse,
  IngestResponse,
  ScoredDocument,
} from "@/interfaces/document.interface";
import { getGeminiEmbedding } from "../rag/getGeminiEmbedding";
import { QueryRequest, QueryResponse } from "@/interfaces/rag.interface";

interface CollectionInfo {
  collection_name: string;
  vectors_count: number;
  status: string;
}

export interface VectorDBInterface {
  addDocumentsBulk(documents: Document[]): Promise<IngestResponse>;
  getCollectionInfo(): Promise<CollectionInfo>;
  setupCollection(EMBEDDING_SIZE: number): Promise<void>;
  queryRag(question: string): Promise<string>;
  getDocumentById(id: string): Promise<GetDocumentResponse | null>;
  deleteDocumentById(id: string): Promise<DeleteDocumentResponse>;
  retrieveDocuments(request: QueryRequest): Promise<QueryResponse>;
}

class VectorDB implements VectorDBInterface {
  private readonly COLLECTION_NAME: string;
  private readonly qdrantClient: QdrantClient;

  constructor(collectionName: string, qdrantClient: QdrantClient) {
    this.COLLECTION_NAME = collectionName;
    this.qdrantClient = qdrantClient;
  }
  async addDocumentsBulk(documents: Document[]): Promise<IngestResponse> {
    const errors: string[] = [];

    const pointsPromises = documents.map(async (doc) => {
      try {
        const embedding = await getGeminiEmbedding(doc.content);
        return {
          id: doc.id || new Date().getTime().toString(),
          vector: embedding,
          payload: { content: doc.content, metadata: doc.metadata },
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unknown error occurred during embedding generation";
        errors.push(
          `Failed to process document with content starting: "${doc.content.substring(
            0,
            50
          )}...". Error: ${message}`
        );
        return null;
      }
    });

    const points = (await Promise.all(pointsPromises)).filter(
      (p): p is NonNullable<typeof p> => p !== null
    );

    if (points.length === 0) {
      return { ingestedCount: 0, errors };
    }

    try {
      await this.qdrantClient.upsert(this.COLLECTION_NAME, {
        wait: true,
        points: points,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during upsert";
      errors.push(`Failed to upsert batch of documents. Error: ${message}`);
      return { ingestedCount: 0, errors };
    }

    return { ingestedCount: points.length, errors };
  }

  async getCollectionInfo(): Promise<CollectionInfo> {
    return await getCollectionInfo(this.qdrantClient, this.COLLECTION_NAME);
  }

  async setupCollection(EMBEDDING_SIZE: number): Promise<void> {
    return await setupCollection(
      this.qdrantClient,
      this.COLLECTION_NAME,
      EMBEDDING_SIZE
    );
  }

  async queryRag(question: string): Promise<string> {
    return await queryRag(question, this.qdrantClient, this.COLLECTION_NAME);
  }

  async getDocumentById(id: string): Promise<GetDocumentResponse | null> {
    const response = await this.qdrantClient.retrieve(this.COLLECTION_NAME, {
      ids: [id],
      with_payload: true,
      with_vector: false,
    });

    if (response.length === 0) {
      return null;
    }

    const point = response[0];
    const payload = point.payload;

    if (!payload || typeof payload.content !== "string") {
      return null;
    }

    const metadata =
      typeof payload.metadata === "object" && payload.metadata !== null
        ? (payload.metadata as Record<string, unknown>)
        : undefined;

    return {
      id: point.id.toString(),
      content: payload.content,
      metadata,
    };
  }

  async deleteDocumentById(id: string): Promise<DeleteDocumentResponse> {
    const response = await this.qdrantClient.delete(this.COLLECTION_NAME, {
      points: [id],
    });

    if (response.status === "completed") {
      return {
        deleted: true,
        message: `Document with id ${id} deleted successfully.`,
      };
    }
    return {
      deleted: false,
      message: `Failed to delete document with id ${id}.`,
    };
  }

  async retrieveDocuments(request: QueryRequest): Promise<QueryResponse> {
    const embedding = await getGeminiEmbedding(request.query);
    const searchResult = await this.qdrantClient.search(this.COLLECTION_NAME, {
      vector: embedding,
      limit: request.topK || 5,
      with_payload: true,
    });

    const documents: ScoredDocument[] = [];
    for (const result of searchResult) {
      const payload = result.payload;
      if (payload && typeof payload.content === "string") {
        const metadata =
          typeof payload.metadata === "object" && payload.metadata !== null
            ? (payload.metadata as Record<string, unknown>)
            : undefined;

        documents.push({
          id: result.id.toString(),
          content: payload.content,
          metadata,
          score: result.score,
        });
      }
    }

    return { documents };
  }
}

export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: qdrantKey,
});

export const vectorDB = new VectorDB(COLLECTION_NAME, qdrantClient);
