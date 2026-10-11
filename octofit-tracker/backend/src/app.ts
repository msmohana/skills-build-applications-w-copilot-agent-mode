import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { activitiesRouter } from './routes/activities.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { teamsRouter } from './routes/teams.js';
import { usersRouter } from './routes/users.js';
import { workoutsRouter } from './routes/workouts.js';

const app = express();
const codespaceName = process.env.CODESPACE_NAME;
const frontendOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);
if (codespaceName) {
  frontendOrigins.add(`https://${codespaceName}-5173.app.github.dev`);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || frontendOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

app.get('/api', (_request, response) => {
  const baseUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : 'http://localhost:8000';

  response.json({
    users: `${baseUrl}/api/users`,
    teams: `${baseUrl}/api/teams`,
    activities: `${baseUrl}/api/activities`,
    leaderboard: `${baseUrl}/api/leaderboard`,
    workouts: `${baseUrl}/api/workouts`,
  });
});

app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/workouts', workoutsRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ error: error.message });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    response.status(400).json({ error: 'Invalid resource identifier' });
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    response.status(409).json({ error: 'A resource with that unique value already exists' });
    return;
  }

  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    response.status(400).json({ error: 'Request body contains invalid JSON' });
    return;
  }

  if (error instanceof Error && error.message === 'Origin not allowed by CORS') {
    response.status(403).json({ error: error.message });
    return;
  }

  console.error('Unhandled API error:', error);
  response.status(500).json({ error: 'Internal server error' });
});

export default app;
