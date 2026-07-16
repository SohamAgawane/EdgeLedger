import { Router } from "express";
import { getDashboard } from "../controllers/analytics.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.get("/dashboard", verifyJWT, getDashboard);

export default router;
