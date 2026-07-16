import { Router } from "express";
import { createRule, getRules, updateRule, deleteRule, toggleRuleActive } from "../controllers/rule.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", verifyJWT, createRule);
router.get("/", verifyJWT, getRules);
router.patch("/:id", verifyJWT, updateRule);
router.delete("/:id", verifyJWT, deleteRule);
router.patch("/:id/toggle", verifyJWT, toggleRuleActive);

export default router;
