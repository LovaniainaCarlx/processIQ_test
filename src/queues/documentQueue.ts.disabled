// @ts-nocheck
import Queue from "bull";
import Document from "../models/Document";
import Batch from "../models/Batch";
import { generatePDF } from "../workers/pdfWorker";
import dotenv from "dotenv";


dotenv.config();

// Création de la queue "documentQueue"
export const documentQueue = new Queue("documentQueue", {
  redis: { host: "127.0.0.1", port: 6379 },
});

// Concurrence 5 jobs en parallèle
/*documentQueue.process(5, async (job) => {
  const { documentId, batchId } = job.data;

  console.log(`Processing document ${documentId} for batch ${batchId}`);

  try {
    // 1️⃣ Marquer en processing
    await Document.updateOne(
      { documentId },
      { status: "processing" }
    );

    await Batch.updateOne(
      { batchId },
      { status: "processing" }
    );

    // 2️⃣ Générer PDF
    const filePath = await generatePDF(job.data);

    // 3️⃣ Marquer document terminé
    await Document.updateOne(
      { documentId },
      {
        status: "completed",
        filePath
      }
    );

    // 4️⃣ Vérifier si tout est terminé
    const remaining = await Document.countDocuments({
      batchId,
      status: { $ne: "completed" }
    });

    // 5️⃣ Si terminé → batch completed
    if (remaining === 0) {
      await Batch.updateOne(
        { batchId },
        { status: "completed" }
      );

      console.log(`Batch ${batchId} completed ✅`);
    }

    return { filePath };

  } catch (error) {
    console.error("Error generating PDF:", error);

    await Document.updateOne(
      { documentId },
      { status: "failed" }
    );

    await Batch.updateOne(
      { batchId },
      { status: "failed" }
    );

    throw error;
  }
}
  );*/