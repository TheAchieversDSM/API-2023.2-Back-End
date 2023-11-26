import subtaskRouter from "./subtaskRoutes";
import statusRouter from "./statusRoutes";
import userRouter from "./userRoutes";
import taskRouter from "./taskRoutes";
import { Router } from "express";
import { auth } from "../middlewares/auth";

const router = Router();

router.use("/user", userRouter);
router.use("/status", statusRouter);
router.use(auth)
router.use("/task", taskRouter);
router.use("/subtask", subtaskRouter);

export default router;