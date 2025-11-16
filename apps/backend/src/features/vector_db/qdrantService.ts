/**
 * @fileoverview This file contains service functions for interacting with the Qdrant vector database.
 * It provides functions for adding documents, getting collection information, and setting up collections.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GEMINI_API_KEY } from "@/core/config";

/**
 * The Google Generative AI Embeddings instance.
 */
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "gemini-embedding-001",
});

/**
 * Adds a single document to the Qdrant collection.
 * @param doc The document to add, containing text and optional metadata.
 * @param qdrantClient The Qdrant client instance.
 * @param COLLECTION_NAME The name of the collection.
 * @returns A promise that resolves to an object containing a success message and the IDs of the added document.
 */
export async function addDocument(
  doc: { text: string; metadata?: Record<string, any> },
  qdrantClient: any,
  COLLECTION_NAME: string
): Promise<{ message: string; ids: any }> {
  try {
    const documents = [
      new Document({
        pageContent: doc.text,
        metadata: doc.metadata,
      }),
    ];
    const qdrantVectorStore = new QdrantVectorStore(embeddings, {
      client: qdrantClient,
      collectionName: COLLECTION_NAME,
    });
    const ids = await qdrantVectorStore.addDocuments(documents);
    return { message: "Document added successfully", ids };
  } catch (e) {
    throw new Error(
      `An unknown error occurred while adding the document: ${e}`
    );
  }
}

/**
 * Adds multiple documents to the Qdrant collection in bulk.
 * @param docs An array of documents to add.
 * @param qdrantClient The Qdrant client instance.
 * @param COLLECTION_NAME The name of the collection.
 * @returns A promise that resolves to an object containing a success message, info, and any failed points.
 */
export async function addDocumentsBulk(
  docs: { text: string; metadata?: Record<string, any> }[],
  qdrantClient: any,
  COLLECTION_NAME: string
): Promise<{
  message: string;
  info: any;
  failedPoints: number[];
}> {
  try {
    const documents = docs.map(
      (doc) =>
        new Document({
          pageContent: doc.text,
          metadata: doc.metadata,
        })
    );
    const qdrantVectorStore = new QdrantVectorStore(embeddings, {
      client: qdrantClient,
      collectionName: COLLECTION_NAME,
    });
    await qdrantVectorStore.addDocuments(documents);
    return {
      message: "Documents added successfully",
      info: null,
      failedPoints: [],
    };
  } catch (e) {
    throw new Error(
      `An unknown error occurred while adding documents in bulk: ${e}`
    );
  }
}

/**
 * Gets information about a Qdrant collection.
 * @param qdrantClient The Qdrant client instance.
 * @param COLLECTION_NAME The name of the collection.
 * @returns A promise that resolves to an object containing the collection name, vectors count, and status.
 */
// Get Collection Info
export async function getCollectionInfo(
  qdrantClient: any,
  COLLECTION_NAME: string
) {
  try {
    const info = await qdrantClient.getCollection(COLLECTION_NAME);
    return {
      collection_name: COLLECTION_NAME,
      vectors_count: info.vectors_count ?? 0,
      status: info.status,
    };
  } catch (e) {
    throw new Error(
      `An unknown error occurred while getting collection info: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

/**
 * Sets up a Qdrant collection if it does not already exist.
 * @param qdrantClient The Qdrant client instance.
 * @param COLLECTION_NAME The name of the collection.
 * @param EMBEDDING_SIZE The size of the embeddings to use for the collection.
 * @returns A promise that resolves when the collection is set up.
 */
// Setup Qdrant Collection
export async function setupCollection(
  qdrantClient: any,
  COLLECTION_NAME: string,
  EMBEDDING_SIZE: number
): Promise<void> {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (col: any) => col.name === COLLECTION_NAME
    );
    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: { size: EMBEDDING_SIZE, distance: "Cosine" },
      });
      console.log(`Created collection: ${COLLECTION_NAME}`);
    } else {
      console.log(`Collection ${COLLECTION_NAME} already exists`);
    }
  } catch (e) {
    console.error("Error setting up collection:", e);
    throw e;
  }
}
