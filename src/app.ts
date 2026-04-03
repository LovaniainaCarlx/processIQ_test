/*import express from "express";
import path from "path";
import { connectDB } from "./db";
import documentRoutes from "./routes/documentRoutes";
import healthRoutes from "./routes/healthRoutes";
import clientRoutes from "./routes/clientRoutes";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/clients", clientRoutes);
app.use("/api/documents", documentRoutes);

// Health check
app.use("/", healthRoutes);

// Port Railway injecte PORT automatiquement
const PORT = process.env.PORT || 3000;

// Connexion MongoDB puis démarrage serveur
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();*/
import express from "express";
import path from "path";
import cors from "cors";
import { connectDB } from "./db";
import documentRoutes from "./routes/documentRoutes";
import healthRoutes from "./routes/healthRoutes";
import clientRoutes from "./routes/clientRoutes";

// Charger dotenv seulement en local
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

// ✅ CORS (obligatoire pour frontend Vercel)
app.use(cors({
  origin: "*" // tu peux remplacer par ton URL Vercel plus tard
}));

// ✅ Middleware JSON
app.use(express.json());

// ✅ Servir fichiers statiques (important après build)
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Routes API
app.use("/api/clients", clientRoutes);
app.use("/api/documents", documentRoutes);

// ✅ Health check
app.use("/", healthRoutes);

// ✅ Port (Render injecte automatiquement)
const PORT = process.env.PORT || 3000;

// ✅ Démarrage serveur après connexion MongoDB
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connecté");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur démarrage serveur :", error);
    process.exit(1);
  }
};

startServer();