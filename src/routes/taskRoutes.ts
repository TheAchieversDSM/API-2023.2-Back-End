import { Router } from "express";
import { TaskController } from "../controllers";

const taskRouter = Router();

taskRouter.post("/create", TaskController.createTask);
taskRouter.get("/all", TaskController.getAllTasks);
taskRouter.get("/getById/:id", TaskController.getTaskById);
taskRouter.get("/getByUserId/:userId", TaskController.getTasksByUserId);


export default taskRouter;