export type LogLevel = "info" | "success" | "warning" | "error";

export interface LogEntry {
  id: string;
  message: string;
  level: LogLevel;
  timestamp: number;
}

export interface GameLogState {
  logs: LogEntry[];
  maxLogs: number; // Keep only last N logs
}
