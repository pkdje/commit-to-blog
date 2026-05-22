import express from 'express';
import healthRouter from './routes/health.js';
import githubRouter from './routes/github.js';
import draftsRouter from './routes/drafts.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api', healthRouter);
  app.use('/api/github', githubRouter);
  app.use('/api/drafts', draftsRouter);

  app.use(errorHandler);

  return app;
}
