import { Request, Response } from "express";
import {
  generateAnswerService,
  retrieveDocumentsService,
} from "../services/query.service";
import { QueryRequest, GenerateRequest } from "../interfaces/rag.interface";

export async function retrieveDocumentsController(req: Request, res: Response) {
  try {
    const queryRequest: QueryRequest = req.body;
    const result = await retrieveDocumentsService(queryRequest);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

export async function generateAnswerController(req: Request, res: Response) {
  try {
    const generateRequest: GenerateRequest = req.body;
    const result = await generateAnswerService(generateRequest);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
