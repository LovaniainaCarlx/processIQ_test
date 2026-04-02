// db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const mongoUri = process.env.MONGO_URI;

// Vérifier que MONGO_URI est défini
if (!mongoUri) {
  console.error("❌ Erreur : MONGO_URI n'est pas défini !");
  process.exit(1);
}

export const connectDB = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(mongoUri, {
      // Options recommandées pour Mongoose 7+
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