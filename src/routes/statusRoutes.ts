import { statusController } from "../controllers";
import { Router } from "express";

const statusRouter = Router();

statusRouter.get("/status", statusController.getStatus,
    // #swagger.tags = ['Status']
);

statusRouter.get("/renewCyclicTasks/:id", statusController.renewCyclicTasks);

export default statusRouter;
