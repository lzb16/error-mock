import type { LogLevel } from './types';

const LOG_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

let currentLevel: LogLevel = 'warn';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_PRIORITY[level] <= LOG_PRIORITY[currentLevel];
}

const PREFIX = '[ErrorMock]';

export const logger = {
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error(PREFIX, ...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(PREFIX, ...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.info(PREFIX, ...args);
  },
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.log(PREFIX, '[debug]', ...args);
  },
};
