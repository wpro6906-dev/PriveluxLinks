import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import userAuthRouter from "./user-auth";
import profileRouter from "./profile";
import linksRouter from "./links";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(userAuthRouter);
router.use(profileRouter);
router.use(linksRouter);
router.use(analyticsRouter);

export default router;
