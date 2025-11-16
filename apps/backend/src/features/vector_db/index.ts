/**
 * @fileoverview This file serves as the main entry point for interacting with the vector database.
 * It provides a `VectorDB` class that implements the `VectorDBInterface` for performing operations
 * such as adding, retrieving, and deleting documents, as well as querying the RAG system.
 */
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

/**
 * Interface for the information about a collection in the vector database.
 */
interface CollectionInfo {
  collection_name: string;
  vectors_count: number;
  status: string;
}

/**
 * Interface for the vector database.
 */
export interface VectorDBInterface {
  /**
   * Adds documents to the vector database in bulk.
   * @param documents An array of documents to add.
   * @returns A promise that resolves to an ingest response, indicating the number of ingested documents and any errors.
   */
  addDocumentsBulk(documents: Document[]): Promise<IngestResponse>;

  /**
   * Gets information about the collection.
   * @returns A promise that resolves to the collection information.
   */
  getCollectionInfo(): Promise<CollectionInfo>;

  /**
   * Sets up the collection in the vector database.
   * @param EMBEDDING_SIZE The size of the embeddings to use for the collection.
   * @returns A promise that resolves when the collection is set up.
   */
  setupCollection(EMBEDDING_SIZE: number): Promise<void>;

  /**
   * Queries the RAG system to get an answer to a question.
   * @param question The question to ask the RAG system.
   * @returns A promise that resolves to the generated answer.
   */
  queryRag(question: string): Promise<string>;

  /**
   * Gets a document by its ID.
   * @param id The ID of the document to get.
   * @returns A promise that resolves to the document, or null if it is not found.
   */
  getDocumentById(id: string): Promise<GetDocumentResponse | null>;

  /**
   * Deletes a document by its ID.
   * @param id The ID of the document to delete.
   * @returns A promise that resolves to a delete response, indicating whether the document was deleted.
   */
  deleteDocumentById(id: string): Promise<DeleteDocumentResponse>;

  /**
   * Retrieves documents based on a query.
   * @param request The query request, containing the query and the number of documents to retrieve.
   * @returns A promise that resolves to a query response, containing the retrieved documents.
   */
  retrieveDocuments(request: QueryRequest): Promise<QueryResponse>;
}

/**
 * A class for interacting with the vector database.
 */
class VectorDB implements VectorDBInterface {
  private readonly COLLECTION_NAME: string;
  private readonly qdrantClient: QdrantClient;

  /**
   * Creates a new VectorDB instance.
   * @param collectionName The name of the collection to use.
   * @param qdrantClient The Qdrant client instance.
   */
  constructor(collectionName: string, qdrantClient: QdrantClient) {
    this.COLLECTION_NAME = collectionName;
    this.qdrantClient = qdrantClient;
  }

  /**
   * Adds documents to the vector database in bulk.
   * @param documents An array of documents to add.
   * @returns A promise that resolves to an ingest response, indicating the number of ingested documents and any errors.
   */
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

  /**
   * Gets information about the collection.
   * @returns A promise that resolves to the collection information.
   */
  async getCollectionInfo(): Promise<CollectionInfo> {
    return await getCollectionInfo(this.qdrantClient, this.COLLECTION_NAME);
  }

  /**
   * Sets up the collection in the vector database.
   * @param EMBEDDING_SIZE The size of the embeddings to use for the collection.
   * @returns A promise that resolves when the collection is set up.
   */
  async setupCollection(EMBEDDING_SIZE: number): Promise<void> {
    return await setupCollection(
      this.qdrantClient,
      this.COLLECTION_NAME,
      EMBEDDING_SIZE
    );
  }

  /**
   * Queries the RAG system to get an answer to a question.
   * @param question The question to ask the RAG system.
   * @returns A promise that resolves to the generated answer.
   */
  async queryRag(question: string): Promise<string> {
    return await queryRag(question, this.qdrantClient, this.COLLECTION_NAME);
  }

  /**
   * Gets a document by its ID.
   * @param id The ID of the document to get.
   * @returns A promise that resolves to the document, or null if it is not found.
   */
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

  /**
   * Deletes a document by its ID.
   * @param id The ID of the document to delete.
   * @returns A promise that resolves to a delete response, indicating whether the document was deleted.
   */
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

  /**
   * Retrieves documents based on a query.
   * @param request The query request, containing the query and the number of documents to retrieve.
   * @returns A promise that resolves to a query response, containing the retrieved documents.
   */
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

/**
 * The Qdrant client instance.
 */
export const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
  apiKey: qdrantKey,
});

/**
 * The VectorDB instance.
 */
export const vectorDB = new VectorDB(COLLECTION_NAME, qdrantClient);
