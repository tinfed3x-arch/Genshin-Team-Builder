import { Router, type IRouter } from "express";
import healthRouter from "./health";
import genshinRouter from "./genshin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(genshinRouter);

export default router;
