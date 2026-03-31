import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  documentId: string;
  batchId: string;
  filename: string;
  status: "pending" | "completed" | "failed";
  filePath?: string; // ✅ AJOUT
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
  filePath: { type: String }, // ✅ AJOUT
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDocument>("Document", DocumentSchema);