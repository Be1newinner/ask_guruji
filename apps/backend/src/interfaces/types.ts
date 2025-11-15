/* eslint-disable @typescript-eslint/no-explicit-any */

// Document and Query Models
export interface QueryInput {
  question: string;
  top_k?: number;
}

export interface RAGResponse {
  answer: string;
  retrieved_documents: Array<{
    text: string;
    metadata?: Record<string, any>;
    similarity_score: number;
  }>;
}

export interface ChunkOutput {
  text: string;
  metadata: {
    chunkId: number;
    page: number;
    fileName: string;
    title: string;
    author: string;
    keywords: string;
    created_at: string;
    modified_at: string;
    total: number;
  };
}
