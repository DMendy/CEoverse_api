import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeOrigins = (value) => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT, 4000),
  contactInbox: process.env.CONTACT_INBOX || 'contact@example.com',
  frontOrigins: normalizeOrigins(process.env.FRONT_ORIGIN),
  rateLimit: {
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW, 60_000),
    max: parseNumber(process.env.RATE_LIMIT_MAX, 10),
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseNumber(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: process.env.SMTP_SECURE === 'true',
  },
});

export const isProduction = env.nodeEnv === 'production';
