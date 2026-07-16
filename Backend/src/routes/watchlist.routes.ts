import { Router } from "express";
import { addToWatchlist, getWatchlist, updateWatchlistItem, removeFromWatchlist } from "../controllers/watchlist.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", verifyJWT, addToWatchlist);
router.get("/", verifyJWT, getWatchlist);
router.patch("/:id", verifyJWT, updateWatchlistItem);
router.delete("/:id", verifyJWT, removeFromWatchlist);

export default router;
