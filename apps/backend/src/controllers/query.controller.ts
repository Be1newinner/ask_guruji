/**
 * @fileoverview This file contains the controllers for handling user queries.
 * It includes controllers for retrieving relevant documents and generating answers.
 */
import { Request, Response } from "express";
import {
  generateAnswerService,
  retrieveDocumentsService,
} from "../services/query.service";
import { QueryRequest, GenerateRequest } from "../interfaces/rag.interface";

/**
 * Controller for retrieving documents based on a user's query.
 * @param req The Express request object, containing the query in the body.
 * @param res The Express response object.
 */
export async function retrieveDocumentsController(req: Request, res: Response) {
  try {
    const queryRequest: QueryRequest = req.body;
    const result = await retrieveDocumentsService(queryRequest);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}

/**
 * Controller for generating an answer based on a user's query and context.
 * @param req The Express request object, containing the query and context documents in the body.
 * @param res The Express response object.
 */
export async function generateAnswerController(req: Request, res: Response) {
  try {
    const generateRequest: GenerateRequest = req.body;
    const result = await generateAnswerService(generateRequest);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
