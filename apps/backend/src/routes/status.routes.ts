import { getStatusController } from "@/controllers/status.controller";
import { Router } from "express";

const router = Router();

router.get("/", getStatusController);

export default router;
