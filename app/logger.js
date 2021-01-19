import { createLogger, format, transports } from 'winston';
import { loggerLevel, env } from './config';

const {
  combine,
  timestamp,
  label,
  printf,
  colorize,
} = format;
const logFormat = printf((info) => `${info.timestamp} [${info.level}] ${info.label} | message: ${info.message} ${info.message.stack ? `: ${info.message.stack}` : ''}`);

export const logger = createLogger({
  format: combine(
    label({ label: 'order-form' }),
    timestamp(),
    colorize(),
    logFormat,
  ),
  transports: [
    new transports.Console({
      level: loggerLevel,
      colourize: (env === 'development'),
    }),
  ],
});
