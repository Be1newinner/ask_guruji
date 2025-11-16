/**
 * @fileoverview This file contains the service for managing the application status.
 * It provides a way to track the uptime and the last indexed time.
 */
import { StatusResponse } from "../interfaces/rag.interface";

/**
 * Interface for the status service.
 */
export interface StatusService {
  /**
   * Sets the timestamp of the last time a document was indexed.
   * @param timestamp The timestamp to set.
   */
  setLastIndexed(timestamp: Date): void;

  /**
   * Gets the current status of the application.
   * @returns The current status of the application.
   */
  getStatus(): StatusResponse;
}

/**
 * Formats a duration in milliseconds into a human-readable string.
 * @param milliseconds The duration in milliseconds.
 * @returns A human-readable string representing the duration.
 */
const formatUptime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days} days`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hours`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60} minutes`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60} seconds`);

  return parts.join(", ") || "0 seconds";
};

/**
 * Creates a new status service instance.
 * @returns A new status service instance.
 */
export const createStatusService = (): StatusService => {
  const startTime = new Date();
  let lastIndexed: Date | null = null;

  return {
    setLastIndexed: (timestamp: Date): void => {
      lastIndexed = timestamp;
    },
    getStatus: (): StatusResponse => {
      const uptimeMilliseconds = new Date().getTime() - startTime.getTime();
      const uptime = formatUptime(uptimeMilliseconds);
      return {
        uptime,
        status: "healthy",
        lastIndexed: lastIndexed ? lastIndexed.toISOString() : undefined,
      };
    },
  };
};
