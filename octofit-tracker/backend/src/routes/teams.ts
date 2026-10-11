import { createCrudRouter } from './crud.js';
import { TeamModel } from '../models/team.js';

export const teamsRouter = createCrudRouter(TeamModel);
