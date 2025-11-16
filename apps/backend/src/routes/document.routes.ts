/**
 * @fileoverview This file defines the routes for document-related operations.
 * It includes routes for ingesting, retrieving, and deleting documents.
 */
import {
  deleteDocumentByIdController,
  getDocumentByIdController,
  ingestDocumentsController,
} from "@/controllers/document.controller";
import { Router } from "express";
import multer from "multer";

const router = Router();
/**
 * Multer instance for handling file uploads.
 * It uses memory storage to store the uploaded file as a buffer.
 */
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @openapi
 * /documents/ingest:
 *   post:
 *     description: Ingest documents from a PDF file.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: "#/components/schemas/IngestFile"
 *     responses:
 *       200:
 *         description: Returns a success message.
 *       400:
 *         description: No file uploaded.
 */
router.post("/ingest", upload.single("file"), ingestDocumentsController);
/**
 * @openapi
 * /documents/{id}:
 *   get:
 *     description: Get a document by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the document.
 *       404:
 *         description: Document not found.
 */
router.get("/:id", getDocumentByIdController);

/**
 * @openapi
 * /documents/{id}:
 *   delete:
 *     description: Delete a document by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a success message.
 *       404:
 *         description: Document not found.
 */
router.delete("/:id", deleteDocumentByIdController);

export default router;
