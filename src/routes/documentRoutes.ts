import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { documentQueue } from "../queues/documentQueue";
import Batch from "../models/Batch";
import Document from "../models/Document"; // ✅ manquant
import Client from "../models/Client";
import mongoose from "mongoose";

const router = Router();

/**
 * POST /api/documents/batch
 */
router.post("/batch", async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0)
    return res.status(400).json({ error: "userIds required" });

  const batchId = uuidv4();
  const documentIds: string[] = [];

  try {
    const documentsToInsert = [];

    for (const userId of userIds) {
      const documentId = uuidv4();
      documentIds.push(documentId);

      // Queue job
      documentQueue.add(
        { documentId, batchId, userId },
        { attempts: 3, backoff: { type: "exponential", delay: 1000 } }
      );

      // Préparer document
      documentsToInsert.push({
        documentId,
        batchId,
        filename: `${documentId}.pdf`,
        userId,
        status: "pending",
      });

      // Upsert client
      await Client.updateOne(
        { userId },
        { $setOnInsert: { name: userId } },
        { upsert: true }
      );
    }

    await Document.insertMany(documentsToInsert);

    const batch = new Batch({ batchId, documentIds });
    await batch.save();

    res.json({ batchId, documentIds });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/documents/batch/:batchId
 */
router.get("/batch/:batchId", async (req, res) => {
  const { batchId } = req.params;

  try {
    const batch = await Batch.findOne({ batchId });
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    const documents = await Document.find({ batchId });

    res.json({
      batchId,
      status: batch.status,
      documents,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

/**
 * ✅ GET /api/documents/:documentId
 * Télécharger PDF depuis GridFS
 */
router.get("/:documentId", async (req, res) => {
  const { documentId } = req.params;

  try {
    const doc = await Document.findOne({ documentId });

    if (!doc || !doc.fileId) {
      return res.status(404).json({
        error: "Document non trouvé ou pas encore généré"
      });
    }

    const bucket = new mongoose.mongo.GridFSBucket(
      mongoose.connection.db!,
      { bucketName: "pdfs" }
    );

    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(doc.fileId)
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.filename}"`
    );
    res.setHeader("Content-Type", "application/pdf");

    downloadStream.pipe(res);

    downloadStream.on("error", () => {
      res.status(500).json({ error: "Erreur téléchargement" });
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

export default router;