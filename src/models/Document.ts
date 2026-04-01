import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  documentId: string;
  batchId: string;
  filename: string;
  status: "pending" | "completed" | "failed";
  filePath?: string; // (optionnel si stockage local)
  fileId?: string;   // ✅ IMPORTANT pour GridFS
  userId: string;
  createdAt: Date;
}

const DocumentSchema: Schema = new Schema({
  documentId: { type: String, required: true, unique: true },
  batchId: { type: String, required: true },
  filename: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending","completed","failed"], 
    default: "pending" 
  },
  filePath: { type: String }, // optionnel
  fileId: { type: String },   // ✅ AJOUT CRITIQUE
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDocument>("Document", DocumentSchema);