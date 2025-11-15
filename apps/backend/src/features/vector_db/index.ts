/* eslint-disable @typescript-eslint/no-explicit-any */
import { QdrantClient } from "@qdrant/js-client-rest";
import {
  addDocument,
  addDocumentsBulk,
  getCollectionInfo,
  setupCollection,
} from "./qdrantService";
import { COLLECTION_NAME, QDRANT_URL } from "@/core/config";
import { queryRag } from "@/utils/queryRag";

interface CollectionInfo {
  collection_name: string;
  vectors_count: number;
  status: string;
}

export interface VectorDBInterface {
  addDocument(doc: {
    text: string;
    metadata?: Record<string, any>;
  }): Promise<{ message: string; id: string }>;
  addDocumentsBulk(
    docs: { text: string; metadata?: Record<string, any> }[]
  ): Promise<{
    message: string;
    info: Record<string, any> | null;
    failedPoints: number[];
  }>;
  getCollectionInfo(): Promise<CollectionInfo>;
  setupCollection(EMBEDDING_SIZE: number): Promise<void>;
  queryRag(question: string): Promise<string>;
}

class VectorDB implements VectorDBInterface {
  private readonly COLLECTION_NAME: string;
  private readonly qdrantClient: QdrantClient;

  constructor(collectionName: string, QdrantClient: QdrantClient) {
    this.COLLECTION_NAME = collectionName;
    this.qdrantClient = QdrantClient;
  }

  async addDocument(doc: {
    text: string;
    metadata?: Record<string, any>;
  }): Promise<{ message: string; id: string }> {
    const data = await addDocument(
      doc,
      this.qdrantClient,
      this.COLLECTION_NAME
    );
    return { id: data.ids[0], message: data.message };
  }

  async addDocumentsBulk(
    docs: { text: string; metadata?: Record<string, any> }[]
  ): Promise<{
    message: string;
    info: Record<string, any> | null;
    failedPoints: number[];
  }> {
    return await addDocumentsBulk(
      docs,
      this.qdrantClient,
      this.COLLECTION_NAME
    );
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
}

export const qdrantClient = new QdrantClient({ url: QDRANT_URL });

export const vectorDB = new VectorDB(COLLECTION_NAME, qdrantClient);
