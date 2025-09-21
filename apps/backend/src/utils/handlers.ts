import { ChunkOutput } from "@/interfaces/types";
import { v4 as uuidv4, type UUIDTypes } from "uuid";

export function convertArraysToBatches<T>(arr: T[], batch_size: number): T[][] {
  if (batch_size <= 0) throw new Error("batch_size must be positive");
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += batch_size) {
    result.push(arr.slice(i, i + batch_size));
  }
  return result;
}

export function convert_point_format_cb(
  embedding: number[],
  doc: ChunkOutput
): {
  id: UUIDTypes;
  vector: number[];
  payload: ChunkOutput;
} {
  const doc_id = uuidv4();

  return {
    id: doc_id,
    vector: embedding,
    payload: doc,
  };
}
