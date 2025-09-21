/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryInput, RAGResponse } from "@/interfaces/types";
import axios from "axios";
import { getGeminiEmbedding } from "./getGeminiEmbedding";

// Query RAG
export async function queryRag(
  query: QueryInput,
  GEMINI_API_KEY: string,
  EMBEDDING_SIZE: number,
  qdrantClient: any,
  COLLECTION_NAME: string
): Promise<RAGResponse> {
  try {
    const query_embedding = await getGeminiEmbedding(
      query.question,
      EMBEDDING_SIZE
    );
    const results = await qdrantClient.search(COLLECTION_NAME, {
      vector: query_embedding,
      limit: query.top_k ?? 3,
      with_payload: true,
    });

    const retrieved_docs = results
      .map((result: any) => ({
        text: result?.payload?.text as string,
        metadata: result?.payload?.metadata ?? {},
        similarity_score: result.score,
      }))
      .filter((doc: any) => doc.text);

    if (retrieved_docs.length === 0) {
      return {
        answer:
          "I couldn't find any relevant documents to answer your question.",
        retrieved_documents: [],
      };
    }

    const context = retrieved_docs.map((doc: any) => doc.text).join("\n\n");
    const augmented_prompt = `
Based on the following context information, please answer the question.
If the answer cannot be found in the context, please say so.

Context:
${context}

Question: ${query.question}

Answer:
    `.trim();

    // Gemini Pro API call (as per 2025, use x-goog-api-key header!)
    const geminiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: augmented_prompt }] }],
      },
      { headers: { "x-goog-api-key": GEMINI_API_KEY } }
    );
    const answer =
      geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Could not generate an answer from the provided context.";
    return { answer, retrieved_documents: retrieved_docs };
  } catch (e) {
    throw new Error(
      `Error processing query: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}
