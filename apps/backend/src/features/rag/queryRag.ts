/**
 * @fileoverview This file contains the core logic for the RAG (Retrieval-Augmented Generation) system.
 * It uses a Qdrant vector store to retrieve relevant documents and a Google Generative AI model to generate answers.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { GEMINI_API_KEY } from "@/core/config";

/**
 * The Google Generative AI Embeddings instance.
 */
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: "gemini-embedding-001",
});

/**
 * The Google Generative AI model instance.
 */
const model = new ChatGoogleGenerativeAI({
  apiKey: GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.1,
});

/**
 * The prompt template for the RAG chain.
 */
const EXAMPLE_PROMPT_TEMPLATE = `
    Answer the question based only on the following context:

    {context}

    Question: {question}
    `;

/**
 * The prompt template instance.
 */
const examplePrompt = PromptTemplate.fromTemplate(EXAMPLE_PROMPT_TEMPLATE);

/**
 * Queries the RAG system to get an answer to a question.
 * @param question The question to ask the RAG system.
 * @param qdrantClient The Qdrant client instance.
 * @param COLLECTION_NAME The name of the collection in the Qdrant vector store.
 * @returns A promise that resolves to the generated answer.
 */
export async function queryRag(
  question: string,
  qdrantClient: any,
  COLLECTION_NAME: string
): Promise<string> {
  try {
    const qdrantVectorStore = new QdrantVectorStore(embeddings, {
      client: qdrantClient,
      collectionName: COLLECTION_NAME,
    });

    const retriever = qdrantVectorStore.asRetriever();

    const setupAndRetrieval = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: (input: Record<string, unknown>) =>
          retriever
            .invoke(input.question as string)
            .then((docs) => docs.map((doc) => doc.pageContent).join("\n\n")), // map to string here
      }),
      examplePrompt,
      model,
      new StringOutputParser(),
    ]);

    const response = await setupAndRetrieval.invoke({ question });
    return response;
  } catch (e) {
    throw new Error(
      `Error processing query: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}
