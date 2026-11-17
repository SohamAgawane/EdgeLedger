
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

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "https://edge-ledger-three.vercel.app,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""));

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ""))) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/api/v1", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "EdgeLedger API is running",
    version: "1.0.0",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/trades", tradeRouter);
app.use("/api/v1/watchlist", watchlistRouter);
app.use("/api/v1/rules", ruleRouter);
app.use("/api/v1/analytics", analyticsRouter);

app.use(errorHandler);

export { app };
