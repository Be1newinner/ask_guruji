/**
 * @fileoverview This file contains utility functions for handling data.
 * It includes functions for converting arrays to batches and formatting data for the vector database.
 */
import { Document } from "@/interfaces/document.interface";
import { v4 as uuidv4, type UUIDTypes } from "uuid";

/**
 * Converts an array into an array of smaller batches.
 * @param arr The array to convert.
 * @param batch_size The size of each batch.
 * @returns An array of smaller arrays, where each inner array is a batch.
 */
export function convertArraysToBatches<T>(arr: T[], batch_size: number): T[][] {
  if (batch_size <= 0) throw new Error("batch_size must be positive");
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += batch_size) {
    result.push(arr.slice(i, i + batch_size));
  }
  return result;
}

/**
 * Converts an embedding and a document into the format expected by the vector database.
 * @param embedding The embedding of the document.
 * @param doc The document to convert.
 * @returns An object containing the ID, vector, and payload for the document.
 */
export function convert_point_format_cb(
  embedding: number[],
  doc: Document
): {
  id: UUIDTypes;
  vector: number[];
  payload: Document;
} {
  const doc_id = uuidv4();

  return {
    id: doc_id,
    vector: embedding,
    payload: doc,
  };
}
