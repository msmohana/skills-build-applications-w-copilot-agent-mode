import { createCrudRouter } from './crud.js';
import { ActivityModel } from '../models/activity.js';

export const activitiesRouter = createCrudRouter(ActivityModel, { performedAt: -1 });
