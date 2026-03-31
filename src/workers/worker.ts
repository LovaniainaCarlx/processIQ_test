import { documentQueue } from "../queues/documentQueue";
import { connectDB } from "../db";
import Document from "../models/Document";
import { generatePDF } from "./pdfWorker";
import { logger } from "../utils/logger";
import { documentsGenerated, batchProcessingDuration } from "../utils/metrics";

console.log("🚀 Worker démarré"); // garde juste pour le premier lancement

documentQueue.on("ready", () => {
  logger.info("Redis connecté (worker)");
});

documentQueue.on("error", (err) => {
  logger.error("Redis erreur (worker)", { error: err.message });
});

connectDB().then(() => {
  logger.info("Mongo connecté dans worker");

  documentQueue.process(20, async (job) => {
    const start = Date.now();
    logger.info("Processing document", { batchId: job.data.batchId, documentId: job.data.documentId });

    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("PDF timeout")), 5000)
      );

      const fileId = await Promise.race([
        generatePDF(job.data),
        timeout,
      ]);

      await Document.updateOne(
        { documentId: job.data.documentId },
        { status: "completed", fileId }
      );

      // ✅ Incrémenter métrique Prometheus
      documentsGenerated.inc();

      // Histogramme durée batch (approximatif par document ici)
      batchProcessingDuration.observe((Date.now() - start) / 1000);

      logger.info("PDF généré avec succès", { batchId: job.data.batchId, documentId: job.data.documentId, fileId });

      return { fileId };

    } catch (error: unknown) {
      // Vérification du type
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }

      logger.error("Worker error", { batchId: job.data.batchId, documentId: job.data.documentId, error: errorMessage });

      await Document.updateOne(
        { documentId: job.data.documentId },
        { status: "failed" }
      );

      throw error;
    }
  });
});