import mongoose from "mongoose";

export interface IClient extends mongoose.Document {
  userId: string;
  name: string;
}

const ClientSchema = new mongoose.Schema<IClient>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

export default mongoose.model<IClient>("Client", ClientSchema);