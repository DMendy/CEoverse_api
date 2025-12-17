import { HttpError } from '../utils/httpError.js';

export const notFoundHandler = (req, res, next) => {
  next(new HttpError(404, `Route ${req.originalUrl} introuvable.`));
};
