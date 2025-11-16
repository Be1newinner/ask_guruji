import { getStatusController } from "@/controllers/status.controller";
import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /status:
 *   get:
 *     description: Get the status of the server.
 *     responses:
 *       200:
 *         description: Returns the status of the server.
 */
router.get("/", getStatusController);

export default router;
