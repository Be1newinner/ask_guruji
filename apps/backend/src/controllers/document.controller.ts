/**
 * @fileoverview This file contains the controllers for document-related operations.
 * It handles the ingestion, retrieval, and deletion of documents.
 */
import { Request, Response } from "express";
import {
  deleteDocumentByIdService,
  getDocumentByIdService,
  ingestDocumentsService,
} from "../services/document.service";
import { createStatusService } from "@/services/status.service";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/**
 * Controller for ingesting documents.
 * It handles file uploads, splits the document into chunks, and ingests them into the vector database.
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const ingestDocumentsController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileBlob = new Blob([new Uint8Array(req.file.buffer)], {
      type: req.file.mimetype,
    });

    const loader = new PDFLoader(fileBlob);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splits = await textSplitter.splitDocuments(docs);

    const result = await ingestDocumentsService({
      documents: splits.map((doc) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      })),
    });

    const statusService = createStatusService();
    statusService.setLastIndexed(new Date());

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

/**
 * Controller for retrieving a document by its ID.
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const getDocumentByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const document = await getDocumentByIdService(id);
    if (document) {
      res.status(200).json(document);
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

/**
 * Controller for deleting a document by its ID.
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const deleteDocumentByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const result = await deleteDocumentByIdService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
