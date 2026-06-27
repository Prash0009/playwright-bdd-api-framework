import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../config/env.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, scenario, stack }) => {
  const scope = scenario ? ` [${scenario}]` : '';
  return `${ts} ${level.toUpperCase()}${scope}: ${stack || message}`;
});

/**
 * Structured Winston logger.
 * - Console output (colorised) for local/CI run visibility.
 * - Rotating file output under /logs for artifact upload & debugging.
 * Use `logger.child({ scenario })` (see hooks) to tag lines with the scenario name.
 */
export const logger = winston.createLogger({
  level: config.logLevel,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss.SSS' }),
        logFormat
      ),
    }),
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'api-tests-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '7d',
      zippedArchive: false,
    }),
  ],
});

export default logger;
