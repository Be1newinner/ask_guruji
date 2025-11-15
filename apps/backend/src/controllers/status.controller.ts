import { Request, Response } from "express";
import { createStatusService } from "../services/status.service";

export async function getStatusController(_: Request, res: Response) {
  try {
    const statusService = createStatusService();
    const status = statusService.getStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
