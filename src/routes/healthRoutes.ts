import { Router } from "express";
import mongoose from "mongoose";
import { documentQueue } from "../queues/documentQueue";

const router = Router();

router.get("/health", async (req, res) => {
  const mongoState = mongoose.connection.readyState === 1 ? "ok" : "down";

  let redisState = "unknown";
  let queueState = "unknown";

  try {
    await documentQueue.client.ping();
    redisState = "ok";

    const counts = await documentQueue.getJobCounts();
    queueState = counts ? "ok" : "down";
  } catch {
    redisState = "down";
    queueState = "down";
  }

  const status = mongoState === "ok" && redisState === "ok" && queueState === "ok" ? "ok" : "fail";

  res.json({
    status,
    mongo: mongoState,
    redis: redisState,
    queue: queueState,
  });
});

export default router;