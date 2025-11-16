/**
 * @fileoverview This file contains a utility function for reading and processing PDF documents.
 * It uses the PDFLoader to load the document, and the RecursiveCharacterTextSplitter to split it into chunks.
 */
import "dotenv/config";
import { join } from "path";
import { SRC_DIR } from "@/core/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/**
 * Reads a PDF document, splits it into chunks, and extracts metadata.
 * @param fileName The name of the PDF file to read.
 * @returns A promise that resolves to an object containing the number of pages, the chunks with metadata, and the document info.
 */
export async function readDocumentContentAndMetadata(fileName: string) {
  try {
    const pdfPath = join(SRC_DIR, "pdfs", fileName);

    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);

    const chunksWithMeta = splitDocs.map((doc, idx) => ({
      text: doc.pageContent,
      metadata: {
        chunkId: idx + 1,
        page: doc.metadata.loc.pageNumber,
        fileName: fileName,
        title: doc.metadata.title || "",
        author: doc.metadata.author || "",
        keywords: doc.metadata.keywords || "",
        created_at: doc.metadata.creationDate || "",
        modified_at: doc.metadata.modDate || "",
        total: docs.length,
      },
    }));

    return {
      numPages: docs.length,
      chunks: chunksWithMeta,
      info: docs[0]?.metadata || {},
      metadata: docs[0]?.metadata || {},
    };
  } catch (error) {
    console.log("PDF PARSER ERROR: ", error);
    throw error;
  }
}
