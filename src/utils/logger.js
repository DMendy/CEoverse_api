import { env } from '../config/env.js';

const formatMessage = (level, message, meta) => {
  const payload = {
    level,
    message,
    ...(meta && Object.keys(meta).length ? { meta } : {}),
  };
  return JSON.stringify(payload);
};

export const logger = {
  info: (message, meta) => {
    console.log(formatMessage('info', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage('warn', message, meta));
  },
  error: (message, meta) => {
    console.error(formatMessage('error', message, meta));
  },
  debug: (message, meta) => {
    if (env.nodeEnv === 'development') {
      console.debug(formatMessage('debug', message, meta));
    }
  },
};
