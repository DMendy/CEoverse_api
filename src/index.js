import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.port, () => {
  logger.info('CEOverse API démarrée', {
    port: env.port,
    env: env.nodeEnv,
  });
});

const gracefulShutdown = (signal) => {
  logger.info(`Signal ${signal} reçu, arrêt du serveur...`);
  server.close(() => {
    process.exit(0);
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});

process.on('unhandledRejection', (error) => {
  logger.error('Rejection non gérée', { error: error?.message });
});

process.on('uncaughtException', (error) => {
  logger.error('Exception non gérée', { error: error?.message });
  process.exit(1);
});
