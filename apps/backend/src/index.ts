// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { QdrantClient } from "@qdrant/js-client-rest";
import { readDocumentContentAndMetadata } from "./utils/readDocumentContentAndMetadata";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { vectorDB } from "./features/vector_db";

export const SRC_DIR = dirname(fileURLToPath(import.meta.url));

// Configuration

async function main() {
  console.log("Starting RAG pipeline test...");
  // await vectorDB.setupCollection();
  const pdf = await readDocumentContentAndMetadata("bhagavad-gita.pdf");
  // console.log(pdf.info);
  // console.log(pdf.numPages);
  // console.log(pdf.chunks);
  // const d: DocumentInput = {
  //   text: "Sample document about AI.",
  //   metadata: { type: "sample" },
  // };
  console.log(await vectorDB.addDocumentsBulk(pdf.chunks, 20));

  // console.log(await addDocument());
  // const q: QueryInput = { question: "What is AI?", top_k: 1 };
  // console.log(await queryRag(q));
  // console.log(await getCollectionInfo());
}

main();
