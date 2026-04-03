import { Router, Request, Response } from "express";
import Client from "../models/Client";

const router = Router();

// GET /api/clients => liste tous les clients
router.get("/", async (req: Request, res: Response) => {
  try {
    const clients = await Client.find({}, { _id: 0, userId: 1, name: 1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les clients" });
  }
});

// POST /api/clients => ajouter un client
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, name } = req.body;

    // 🔒 Vérification
    if (!userId || !name) {
      return res.status(400).json({ error: "userId et name requis" });
    }

    const client = new Client({ userId, name });
    await client.save();

    res.status(201).json({ message: "Client ajouté", client });
  } catch (err: any) {
    // Gestion doublon
    if (err.code === 11000) {
      return res.status(400).json({ error: "Client déjà existant" });
    }

    res.status(500).json({ error: "Impossible d'ajouter le client" });
  }
});

// PATCH /api/clients/:userId => modifier client
router.patch("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    const client = await Client.findOneAndUpdate(
      { userId },
      { name },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ error: "Client non trouvé" });
    }

    res.json({ message: "Client modifié", client });
  } catch (err) {
    res.status(500).json({ error: "Erreur modification" });
  }
});

// DELETE /api/clients/:userId => supprimer client
router.delete("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const client = await Client.findOneAndDelete({ userId });

    if (!client) {
      return res.status(404).json({ error: "Client non trouvé" });
    }

    res.json({ message: "Client supprimé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

export default router;