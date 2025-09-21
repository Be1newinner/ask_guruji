/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChunkOutput } from "@/interfaces/types";
import {
  getGeminiEmbedding,
  getGeminiEmbeddingsBulk,
} from "@/utils/getGeminiEmbedding";
import { convertArraysToBatches } from "@/utils/handlers";
import { UUIDTypes, v4 as uuidv4 } from "uuid";

// Add Document
export async function addDocument(
  doc: ChunkOutput,
  qdrantClient: any,
  EMBEDDING_SIZE: number,
  COLLECTION_NAME: string
): Promise<{ message: string; id: string }> {
  try {
    const embedding = await getGeminiEmbedding(doc.text, EMBEDDING_SIZE);
    console.log({ embedding });
    const doc_id = uuidv4();
    const info = await qdrantClient.upsert(COLLECTION_NAME, {
      points: [
        {
          id: doc_id,
          vector: embedding,
          payload: { text: doc.text, metadata: doc.metadata ?? {} },
        },
      ],
    });
    console.log("info", info);
    return { message: "Document added successfully", id: doc_id };
  } catch (e) {
    throw new Error(
      `An unknown error occurred while adding the document: ${e}`
    );
  }
}

export async function addDocumentsBulk(
  docs: ChunkOutput[],
  qdrantClient: any,
  EMBEDDING_SIZE: number,
  COLLECTION_NAME: string,
  batchSize: number = 100,
  start_at: number = 0
): Promise<{
  message: string;
  info: any;
  failedPoints: number[];
}> {
  const docs_batches = convertArraysToBatches<ChunkOutput>(
    docs.slice(start_at),
    batchSize
  );
  // console.log(docs_batches.flat(), docs_batches.flat().length);
  const points: { id: UUIDTypes; vector: number[]; payload: ChunkOutput }[] =
    [];
  const failedBatchIndexes: number[] = [];

  for (let i = 0; i < docs_batches.length; i++) {
    try {
      const batchEmbeddings = await getGeminiEmbeddingsBulk(
        docs_batches[i],
        EMBEDDING_SIZE
      );
      points.push(...batchEmbeddings);
    } catch (e: unknown) {
      console.error(e);
      if (
        (e as Error).message.includes("429") ||
        (e as Error).message.includes("quota")
      ) {
        failedBatchIndexes.push(start_at + i);
        break;
      }
      failedBatchIndexes.push(start_at + i);
    }
  }

  if (!points.length)
    return {
      message: "no document is added!",
      info: null,
      failedPoints: failedBatchIndexes,
    };

  const info = await qdrantClient.upsert(COLLECTION_NAME, {
    points: points.flat(),
  });
  return {
    message: "Documents added successfully",
    info: info,
    failedPoints: failedBatchIndexes,
  };
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
