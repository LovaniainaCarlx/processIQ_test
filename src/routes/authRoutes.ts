import express from "express";
import User from "../models/User";

const router = express.Router();

// Exemple register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = new User({ email, password });
    await user.save();

    res.json({ message: "User created" });
  } catch (error) {
    res.status(500).json({ error: "Erreur création user" });
  }
});

// Exemple login
router.post("/login", async (req, res) => {
  res.json({ message: "Login route OK" });
});

export default router; 