// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Étendre le type Request pour inclure `user`
export interface AuthRequest extends Request {
  user?: {
    id: string;      // id de l'utilisateur
    role?: string;   // rôle facultatif (admin/user)
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token" });
    }

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string; role?: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};