import { DataBaseSource } from "../config/database";
import { User } from "../models/User";

export const UserRepository = DataBaseSource.getRepository(User)