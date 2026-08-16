export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
  detail?: string;
}

const MAX_LOGS = 300;

let logs: LogEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function formatDetail(detail: unknown): string {
  if (detail === undefined) return '';
  if (detail instanceof Error) return detail.stack ?? detail.message;
  if (typeof detail === 'string') return detail;
  try {
    return JSON.stringify(detail, null, 2);
  } catch {
    return String(detail);
  }
}

/** Registra uma entrada no log de diagnóstico exibido na tela de Perfil. */
export function addLog(level: LogLevel, message: string, detail?: unknown) {
  const entry: LogEntry = {
    id: nextId++,
    timestamp: new Date().toISOString(),
    level,
    message,
    detail: detail === undefined ? undefined : formatDetail(detail),
  };
  logs = [entry, ...logs].slice(0, MAX_LOGS);
  notify();
}

export function clearLogs() {
  logs = [];
  notify();
}

export function getLogs(): LogEntry[] {
  return logs;
}

export function subscribeLogs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
