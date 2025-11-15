import {
  deleteDocumentByIdController,
  getDocumentByIdController,
  ingestDocumentsController,
} from "@/controllers/document.controller";
import { Router } from "express";

const router = Router();

router.post("/ingest", ingestDocumentsController);
router.get("/:id", getDocumentByIdController);
router.delete("/:id", deleteDocumentByIdController);

export default router;
