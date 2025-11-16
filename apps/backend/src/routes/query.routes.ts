import {
  generateAnswerController,
  retrieveDocumentsController,
} from "@/controllers/query.controller";
import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /query/retrieve:
 *   post:
 *     description: Retrieve documents based on a query.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a list of relevant documents.
 */
router.post("/retrieve", retrieveDocumentsController);

/**
 * @openapi
 * /query/generate:
 *   post:
 *     description: Generate an answer based on a query and context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *               context:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Returns the generated answer.
 */
router.post("/generate", generateAnswerController);

export default router;
