import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGO_URI;

// Vérifie MONGO_URI dès le démarrage
if (!mongoUri) {
  console.error("❌ Erreur : MONGO_URI n'est pas défini !");
  process.exit(1);
}

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connecté");
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message || error);
    process.exit(1);
  }
};