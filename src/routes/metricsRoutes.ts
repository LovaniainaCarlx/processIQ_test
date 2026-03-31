import { Router } from "express";
import { register, updateQueueMetrics } from "../utils/metrics";

const router = Router();

router.get("/metrics", async (req, res) => {
  try {
    await updateQueueMetrics();        // met à jour la taille de la queue
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics()); // retourne toutes les métriques au format Prometheus
  } catch (err: unknown) {
    // Vérification du type avant d'accéder à .message
    let errorMessage: string;
    if (err instanceof Error) {
      errorMessage = err.message;
    } else {
      errorMessage = String(err);
    }
    res.status(500).send(errorMessage);
  }
});

export default router;