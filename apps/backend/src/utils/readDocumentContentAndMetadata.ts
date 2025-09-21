/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { readFile } from "fs/promises";
import { join } from "path";
import pdfParse from "pdf-parse";
import { SRC_DIR } from "..";

function chunkString(text: string, size: number) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

export async function readDocumentContentAndMetadata(fileName: string) {
  try {
    const pdfPath = join(SRC_DIR, "pdfs", fileName);
    const existingPdfBytes = await readFile(pdfPath);

    const pagePromises: Array<Promise<{ page: number; text: string }>> = [];
    let totalPages = 0;
    let docInfo: any = {};

    const data = await pdfParse(existingPdfBytes, {
      pagerender: (pageData: any) => {
        const promise = pageData.getTextContent
          ? pageData.getTextContent().then((tc: any) => ({
              page: pageData.pageIndex + 1,
              text: tc.items
                .map((item: any) => item.str)
                .join(" ")
                .trim(),
            }))
          : Promise.resolve({ page: pageData.pageIndex + 1, text: "" });
        pagePromises.push(promise);
        totalPages = pageData.transport
          ? pageData.transport.numPages
          : totalPages;
        return "";
      },
    });
    docInfo = data.info;

    const pageTexts: Array<{ page: number; text: string }> =
      await Promise.all(pagePromises);

    const chunksWithMeta: any[] = [];
    for (const { page, text } of pageTexts) {
      const chunks = chunkString(text, 500);
      chunks.forEach((chunk, idx) => {
        chunksWithMeta.push({
          text: chunk,
          metadata: {
            chunkId: idx + 1,
            page: page,
            fileName: fileName,
            title: data.info.Title,
            author: data.info.Author,
            keywords: data.info.Keywords,
            created_at: data.info.CreationDate,
            modified_at: data.info.ModDate,
            total: totalPages || data.numpages,
          },
        });
      });
    }

    return {
      numPages: totalPages || data.numpages,
      chunks: chunksWithMeta,
      info: docInfo,
      metadata: data.metadata,
    };
  } catch (error) {
    console.log("PDF PARSER ERROR: ", error);
    throw error;
  }
}
