import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

interface PDFJob {
  documentId: string;
  batchId: string;
}

export const generatePDF = async ({ documentId, batchId }: PDFJob) => {
  return new Promise<string>((resolve, reject) => {
    const db = mongoose.connection.db;
    if (!db) return reject(new Error("MongoDB not connected"));

    const bucket = new GridFSBucket(db, { bucketName: "pdfs" });
    const filename = `${documentId}.pdf`;
    const uploadStream = bucket.openUploadStream(filename, { metadata: { documentId, batchId } });

    const doc = new PDFDocument();
    doc.pipe(uploadStream);

    doc.fontSize(20).text(`Document ${documentId}`, { align: "center" });
    doc.text(`Batch: ${batchId}`, { align: "center" });
    doc.end();

    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
    uploadStream.on("error", (err) => reject(err));
  });
};