/**
 * @fileoverview This file provides functions for generating embeddings using the Gemini API.
 * It includes functions for generating single and bulk embeddings.
 */
import { GEMINI_API_KEY } from "@/core/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set.");
}

/**
 * The Google Generative AI Embeddings instance.
 */
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "gemini-embedding-001",
});

/**
 * Generates an embedding for a single piece of text.
 * @param text The text to generate an embedding for.
 * @returns A promise that resolves to an array of numbers representing the embedding.
 */
export async function getGeminiEmbedding(text: string): Promise<number[]> {
  try {
    const response = await embeddings.embedQuery(text);
    return response;
  } catch (error) {
    console.log(error);
    throw new Error(
      "ERROR : CREATING EMBEDING ERROR " + (error as Error).message
    );
  }
}

/**
 * Generates embeddings for multiple pieces of text in bulk.
 * @param texts An array of strings to generate embeddings for.
 * @returns A promise that resolves to an array of arrays of numbers, where each inner array is an embedding.
 */
export async function getGeminiEmbeddingsBulk(
  texts: string[]
): Promise<number[][]> {
  try {
    const response = await embeddings.embedDocuments(texts);
    return response;
  } catch (error) {
    throw new Error(
      "ERROR : CREATING EMBEDDINGS BULK ERROR " + (error as Error).message
    );
  }
}
