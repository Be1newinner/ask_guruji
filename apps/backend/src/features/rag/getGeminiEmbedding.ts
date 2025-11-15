import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set.");
}

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "gemini-embedding-001",
});

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
