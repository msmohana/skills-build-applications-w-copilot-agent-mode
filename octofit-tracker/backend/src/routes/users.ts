import { createCrudRouter } from './crud.js';
import { UserModel } from '../models/user.js';

export const usersRouter = createCrudRouter(UserModel);
