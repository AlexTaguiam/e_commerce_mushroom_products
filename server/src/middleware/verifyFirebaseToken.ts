import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";

export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      ...decodedToken,
      role: (decodedToken.role as string) || "customer",
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
