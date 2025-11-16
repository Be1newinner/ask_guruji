/**
 * @fileoverview This file contains the controller for retrieving the status of the application.
 * It provides an endpoint to check the health and status of the service.
 */
import { Request, Response } from "express";
import { createStatusService } from "../services/status.service";

/**
 * Controller for retrieving the application status.
 * It returns the current status of the application, including the last indexed time.
 * @param _ The Express request object (unused).
 * @param res The Express response object.
 */
export async function getStatusController(_: Request, res: Response) {
  try {
    const statusService = createStatusService();
    const status = statusService.getStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
}
