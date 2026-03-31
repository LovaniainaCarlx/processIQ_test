import mongoose, { Schema, Document } from "mongoose";

export interface IBatch extends Document {
  batchId: string;
  status: "pending" | "processing" | "completed" | "failed";
  documentIds: string[];
  createdAt: Date;
}

const BatchSchema: Schema = new Schema({
  batchId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending","processing","completed","failed"], default: "pending" },
  documentIds: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBatch>("Batch", BatchSchema);