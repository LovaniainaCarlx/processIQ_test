// routes/clientRoutes.ts
import { Router } from "express";
import Client from "../models/Client";
import { auth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/clients => liste clients de l'utilisateur connecté
router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const clients = await Client.find(
      { ownerId: req.user!.id }, // ! car on sait que user existe après auth
      { _id: 0, userId: 1, name: 1, email: 1, address: 1, gender: 1, message: 1 }
    );
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les clients" });
  }
});

// POST /api/clients => ajouter un client
router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const { userId, name, email, address, gender, message } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: "userId et name requis" });
    }

    const client = new Client({
      ownerId: req.user!.id,
      userId,
      name,
      email,
      address,
      gender,
      message
    });

    await client.save();
    res.status(201).json({ message: "Client ajouté", client });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Client déjà existant" });
    }
    res.status(500).json({ error: "Impossible d'ajouter le client" });
  }
});

// PATCH /api/clients/:userId => modifier client
router.patch("/:userId", auth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { name, email, address, gender, message } = req.body;

    const client = await Client.findOneAndUpdate(
      { userId, ownerId: req.user!.id },
      { name, email, address, gender, message },
      { new: true }
    );

    if (!client) return res.status(404).json({ error: "Client non trouvé" });

    res.json({ message: "Client modifié", client });
  } catch (err) {
    res.status(500).json({ error: "Erreur modification" });
  }
});

// DELETE /api/clients/:userId => supprimer client
router.delete("/:userId", auth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    const client = await Client.findOneAndDelete({ userId, ownerId: req.user!.id });

    if (!client) return res.status(404).json({ error: "Client non trouvé" });

    res.json({ message: "Client supprimé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

export default router;