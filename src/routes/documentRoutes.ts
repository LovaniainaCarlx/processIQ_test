// documentRoutes.ts
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { documentQueue } from "../queues/documentQueue";
import Batch from "../models/Batch";
import Document from "../models/Document";

const router = Router();

// POST /api/documents/batch  <-- on garde juste "/batch"
router.post("/batch", async (req, res) => {
  const { userIds } = req.body; // Array de 1000 IDs

  if (!Array.isArray(userIds) || userIds.length === 0)
    return res.status(400).json({ error: "userIds required" });

  const batchId = uuidv4();
  const documentIds: string[] = [];

  for (const userId of userIds) {
    const documentId = uuidv4();
    documentIds.push(documentId);

    documentQueue.add({ documentId, batchId, userId }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 }
    });

    const doc = new Document({ documentId, batchId, filename: `${documentId}.pdf` });
    await doc.save();
  }

  const batch = new Batch({ batchId, documentIds });
  await batch.save();

  res.json({ batchId, documentIds });
});

// GET /api/documents/batch/:batchId
router.get("/batch/:batchId", async (req, res) => {
  const { batchId } = req.params;

  try {
    const batch = await Batch.findOne({ batchId });

    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    const documents = await Document.find({ batchId });

    res.json({
      batchId,
      status: batch.status,
      documents,
    });

  } catch (error: unknown) {
    let errorMessage: string;
    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = String(error);

    res.status(500).json({ error: errorMessage });
  }
});

export default router;