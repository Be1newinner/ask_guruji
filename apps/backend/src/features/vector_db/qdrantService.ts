/* eslint-disable @typescript-eslint/no-explicit-any */
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "gemini-embedding-001",
});

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
