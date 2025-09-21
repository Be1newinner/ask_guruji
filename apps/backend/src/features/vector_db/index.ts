import { QdrantClient } from "@qdrant/js-client-rest";
import {
  addDocument,
  addDocumentsBulk,
  getCollectionInfo,
  setupCollection,
} from "./qdrantService";
import { COLLECTION_NAME, EMBEDDING_SIZE, QDRANT_URL } from "@/core/config";
import { ChunkOutput } from "@/interfaces/types";

export interface VectorDBInterface {
  addDocument(doc: ChunkOutput): Promise<{ message: string; id: string }>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCollectionInfo(): Promise<any>;

  setupCollection(): Promise<void>;
}

class VectorDB implements VectorDBInterface {
  private readonly EMBEDDING_SIZE: number;
  private readonly COLLECTION_NAME: string;
  private readonly qdrantClient: QdrantClient;

  constructor(
    embeddingSize: number,
    collectionName: string,
    QdrantClient: QdrantClient
  ) {
    this.EMBEDDING_SIZE = embeddingSize;
    this.COLLECTION_NAME = collectionName;
    this.qdrantClient = QdrantClient;
  }

  async addDocument(
    doc: ChunkOutput
  ): Promise<{ message: string; id: string }> {
    return await addDocument(
      doc,
      this.qdrantClient,
      this.EMBEDDING_SIZE,
      this.COLLECTION_NAME
    );
  }

  //   docs: ChunkOutput[],
  // qdrantClient: any,
  // EMBEDDING_SIZE: number,
  // COLLECTION_NAME: string,

  async addDocumentsBulk(
    docs: ChunkOutput[],
    batchSize?: number,
    start_at?: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<{ message: string; info: any; failedPoints: number[] }> {
    return await addDocumentsBulk(
      docs,
      this.qdrantClient,
      this.EMBEDDING_SIZE,
      this.COLLECTION_NAME,
      batchSize,
      start_at
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getCollectionInfo(): Promise<any> {
    return await getCollectionInfo(this.qdrantClient, this.COLLECTION_NAME);
  }

  async setupCollection(): Promise<void> {
    return await setupCollection(
      this.qdrantClient,
      this.COLLECTION_NAME,
      this.EMBEDDING_SIZE
    );
  }
}

const qdrantClient = new QdrantClient({ url: QDRANT_URL });

export const vectorDB = new VectorDB(
  EMBEDDING_SIZE,
  COLLECTION_NAME,
  qdrantClient
);
