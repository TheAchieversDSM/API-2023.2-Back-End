import { DataBaseSource } from '../config/database';
import { Task } from '../models/Task';

export const taskRepository = DataBaseSource.getRepository(Task);