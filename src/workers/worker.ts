// @ts-nocheck
import { documentQueue } from "../queues/documentQueue";
import { connectDB } from "../db";
import Document from "../models/Document";
import { generatePDF } from "./pdfWorker";
import { logger } from "../utils/logger";
import { documentsGenerated, batchProcessingDuration } from "../utils/metrics";

console.log("🚀 Worker démarré");

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
    const { documentId, batchId } = job.data;

    logger.info("Processing document", { batchId, documentId });

    try {
      // 🔹 Appel PDF générateur
      const fileId = await generatePDF({ documentId, batchId });

      // 🔹 Mettre à jour le document dans MongoDB
      await Document.updateOne(
        { documentId },
        { status: "completed", fileId }
      );

      // 🔹 Metrics Prometheus
      documentsGenerated.inc();
      batchProcessingDuration.observe((Date.now() - start) / 1000);

      logger.info("PDF généré avec succès", { batchId, documentId, fileId });

      return { fileId };

    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) errorMessage = error.message;
      else errorMessage = String(error);

      logger.error("Worker error", { batchId, documentId, error: errorMessage });

      await Document.updateOne(
        { documentId },
        { status: "failed" }
      );

      throw error;
    }
  });
});