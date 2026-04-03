import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";

import Batch from "../models/Batch";
import Document from "../models/Document";
import Client from "../models/Client";

const router = Router();

interface PDFJob {
  documentId: string;
  batchId: string;
}

// ======================
// 🔹 GENERATE PDF (direct)
// ======================
async function generatePDF({ documentId, batchId }: PDFJob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const db = mongoose.connection.db;
      if (!db) return reject(new Error("MongoDB not connected"));

      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "pdfs" });
      const filename = `${documentId}.pdf`;
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: { documentId, batchId },
      });

      const doc = new PDFDocument();
      doc.pipe(uploadStream);

      // Contenu du PDF
      doc.fontSize(20).text(`Document ${documentId}`, { align: "center" });
      doc.text(`Batch: ${batchId}`, { align: "center" });

      doc.end();

      uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
      uploadStream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

// ======================
// 🔹 POST /api/documents/batch
// ======================
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

    // Générer les PDFs directement et mettre à jour le status
    for (const documentId of documentIds) {
      try {
        const fileId = await generatePDF({ documentId, batchId });
        await Document.updateOne({ documentId }, { status: "completed", fileId });
      } catch (err) {
        await Document.updateOne({ documentId }, { status: "failed" });
      }
    }

    const batch = new Batch({ batchId, documentIds });
    await batch.save();

    res.json({ batchId, documentIds });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// ======================
// 🔹 GET /api/documents/batch/:batchId
// ======================
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

// ======================
// 🔹 GET /api/documents/:documentId
// ======================
router.get("/:documentId", async (req, res) => {
  const { documentId } = req.params;

  try {
    const doc = await Document.findOne({ documentId });

    if (!doc || !doc.fileId) {
      return res.status(404).json({ error: "Document non trouvé ou pas encore généré" });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName: "pdfs" });
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(doc.fileId));

    res.setHeader("Content-Disposition", `attachment; filename="${doc.filename}"`);
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