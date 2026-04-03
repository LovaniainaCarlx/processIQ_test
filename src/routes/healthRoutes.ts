import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/health", async (_req, res) => {
  // Vérifie l'état MongoDB
  const mongoState = mongoose.connection.readyState === 1 ? "ok" : "down";

  // Redis et queue sont désactivés
  const redisState = "disabled";
  const queueState = "disabled";

  const status = mongoState === "ok" ? "ok" : "fail";

  res.json({
    status,
    mongo: mongoState,
    redis: redisState,
    queue: queueState,
  });
});

export default router;