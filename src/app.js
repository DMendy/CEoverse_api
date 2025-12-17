import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import contactRouter from './routes/contact.routes.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { HttpError } from './utils/httpError.js';

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!env.frontOrigins.length || !origin) {
      return callback(null, true);
    }
    if (env.frontOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new HttpError(403, 'Origine non autorisée.'));
  },
  credentials: false,
};

app.use(cors(corsOptions));
app.use(helmet());
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(
  morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', {
    skip: () => env.nodeEnv === 'test',
  })
);

const contactLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Trop de requêtes, réessayez plus tard.' },
});

app.use('/api/contact', contactLimiter, contactRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
