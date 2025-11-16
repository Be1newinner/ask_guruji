import { Request, Response } from "express";
import {
  deleteDocumentByIdService,
  getDocumentByIdService,
  ingestDocumentsService,
} from "../services/document.service";
import { createStatusService } from "@/services/status.service";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

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
