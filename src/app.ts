import express from "express";
import path from "path";
import { connectDB } from "./db";
import documentRoutes from "./routes/documentRoutes";
import healthRoutes from "./routes/healthRoutes";
import clientRoutes from "./routes/clientRoutes";

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

startServer();