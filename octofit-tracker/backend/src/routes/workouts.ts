import { createCrudRouter } from './crud.js';
import { WorkoutModel } from '../models/workout.js';

export const workoutsRouter = createCrudRouter(WorkoutModel);
