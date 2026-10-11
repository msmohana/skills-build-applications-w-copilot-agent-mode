import { createCrudRouter } from './crud.js';
import { LeaderboardModel } from '../models/leaderboard.js';

export const leaderboardRouter = createCrudRouter(LeaderboardModel, { rank: 1 });
