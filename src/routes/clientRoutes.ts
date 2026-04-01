import { Router, Request, Response } from "express";
import Client from "../models/Client";

const router = Router();

// GET /api/clients => liste tous les clients
router.get("/", async (req: Request, res: Response) => {
  try {
    const clients = await Client.find({}, { _id: 0, userId: 1, name: 1 });
    res.json(clients); // renvoie [{userId, name}, ...]
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les clients" });
  }
});

// POST /api/clients => ajouter un client depuis Postman
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, name } = req.body;
    const client = new Client({ userId, name });
    await client.save();
    res.status(201).json({ message: "Client ajouté", client });
  } catch (err) {
    res.status(500).json({ error: "Impossible d'ajouter le client" });
  }
});

export default router;