import { readDocumentContentAndMetadata } from "./utils/readDocumentContentAndMetadata";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { vectorDB } from "./features/vector_db";
import { EMBEDDING_SIZE } from "./core/config";

export const SRC_DIR = path.join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "assets"
);

// console.log("SRC", SRC_DIR);

async function main() {
  console.log("Starting RAG pipeline test...");

  await vectorDB.setupCollection(EMBEDDING_SIZE);

  const pdf = await readDocumentContentAndMetadata(
    "Bhagavad-gita-As-It_is.pdf"
  );

  // await vectorDB.addDocument(pdf.chunks[0]);
  await vectorDB.addDocumentsBulk(pdf.chunks.slice(0, 4));

  const question = "What is the main teaching of the Bhagavad Gita?";
  const answer = await vectorDB.queryRag(question);
  console.log("Question:", question);
  console.log("Answer:", answer);
}

main();
