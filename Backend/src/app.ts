import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware";

import authRouter from "./routes/auth.routes";
import tradeRouter from "./routes/trade.routes";
import watchlistRouter from "./routes/watchlist.routes";
import ruleRouter from "./routes/rule.routes";
import analyticsRouter from "./routes/analytics.routes";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/trades", tradeRouter);
app.use("/api/v1/watchlist", watchlistRouter);
app.use("/api/v1/rules", ruleRouter);
app.use("/api/v1/analytics", analyticsRouter);

app.use(errorHandler);

export { app };
