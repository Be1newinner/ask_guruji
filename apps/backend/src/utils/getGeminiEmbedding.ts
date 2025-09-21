import { ChunkOutput } from "@/interfaces/types";
import { GoogleGenAI } from "@google/genai";
import { convert_point_format_cb } from "./handlers";
import { UUIDTypes } from "uuid";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const gemini_ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getGeminiEmbedding(
  text: string,
  EMBEDDING_SIZE: number
): Promise<number[]> {
  try {
    const response = await gemini_ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [text],
      config: {
        outputDimensionality: EMBEDDING_SIZE,
      },
    });

    if (
      !response.embeddings ||
      !Array.isArray(response.embeddings) ||
      !response.embeddings[0] ||
      !response.embeddings[0].values
    ) {
      throw new Error("Embeddings not returned by Gemini API.");
    }
    return response.embeddings[0].values;
  } catch (error) {
    console.log(error);
    throw new Error(
      "ERROR : CREATING EMBEDING ERROR " + (error as Error).message
    );
  }
}

export async function getGeminiEmbeddingsBulk(
  docs: ChunkOutput[],
  EMBEDDING_SIZE: number
): Promise<{ id: UUIDTypes; vector: number[]; payload: ChunkOutput }[]> {
  try {
    const response = await gemini_ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: docs.map((doc) => doc.text),
      config: {
        outputDimensionality: EMBEDDING_SIZE,
      },
    });

    if (
      !response.embeddings ||
      !Array.isArray(response.embeddings) ||
      response.embeddings.length !== docs.length ||
      !response.embeddings.every((e) => e && e.values)
    ) {
      throw new Error("Embeddings not returned correctly by Gemini API.");
    }

    return response.embeddings.map((e, idx) =>
      convert_point_format_cb(e.values || [], docs[idx])
    );
  } catch (error) {
    throw new Error(
      "ERROR : CREATING EMBEDDINGS BULK ERROR " + (error as Error).message
    );
  }
}
