import {
  generateAnswerController,
  retrieveDocumentsController,
} from "@/controllers/query.controller";
import { Router } from "express";

const router = Router();

router.post("/retrieve", retrieveDocumentsController);
router.post("/generate", generateAnswerController);

export default router;
