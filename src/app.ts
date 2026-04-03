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
import authRoutes from "./routes/authRoutes";

// dotenv uniquement en local
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}




const app = express();


// ✅ CORS
app.use(cors());

// ✅ JSON
app.use(express.json());

// ✅ Static files
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Routes
app.use("/api/clients", clientRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/auth", authRoutes);

// ✅ Health
app.use("/", healthRoutes);

const PORT = process.env.PORT || 3000;

// ✅ Start server
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