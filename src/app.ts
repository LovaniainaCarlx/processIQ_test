import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./db";
import documentRoutes from "./routes/documentRoutes";
import healthRoutes from "./routes/healthRoutes";



dotenv.config();

const app = express();

// Middleware JSON
app.use(express.json());

// Routes API
app.use("/api/documents", documentRoutes);

// Health check route (montée depuis healthRoutes)
app.use("/", healthRoutes);

// Port depuis .env ou fallback à 3000
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB puis démarrage serveur
connectDB()
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Quitte le processus si MongoDB ne démarre pas
  });