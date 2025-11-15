import { StatusResponse } from "../interfaces/rag.interface";

export interface StatusService {
  setLastIndexed(timestamp: Date): void;
  getStatus(): StatusResponse;
}

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
