import { Request, Response } from "express";
import {
  deleteDocumentByIdService,
  getDocumentByIdService,
  ingestDocumentsService,
} from "../services/document.service";
import { IngestRequest } from "../interfaces/document.interface";
import { createStatusService } from "@/services/status.service";

export const ingestDocumentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const ingestRequest: IngestRequest = req.body;
    const result = await ingestDocumentsService(ingestRequest);

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
