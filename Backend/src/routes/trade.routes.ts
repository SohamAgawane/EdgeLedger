import { Router } from "express";
import { createTrade, getTrades, getTradeById, updateTrade, deleteTrade, importTradesFromCSV } from "../controllers/trade.controller";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", verifyJWT, createTrade);
router.get("/", verifyJWT, getTrades);
router.get("/:id", verifyJWT, getTradeById);
router.patch("/:id", verifyJWT, updateTrade);
router.delete("/:id", verifyJWT, deleteTrade);
router.post("/import-csv", verifyJWT, upload.single("file"), importTradesFromCSV);

export default router;
