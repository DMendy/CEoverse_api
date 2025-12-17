import { HttpError } from '../utils/httpError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;

  if (err instanceof HttpError && err.statusCode) {
    statusCode = err.statusCode;
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
  }

  const response = {
    ok: false,
    error: statusCode === 400 && !(err instanceof HttpError) ? 'Payload JSON invalide.' : err.message || 'Erreur interne du serveur.',
  };

  if (err instanceof HttpError && err.details) {
    response.details = err.details;
  }

  logger.error('Erreur lors du traitement de la requête', {
    statusCode,
    path: req.originalUrl,
    method: req.method,
    error: err.message,
  });

  res.status(statusCode).json(response);
};
