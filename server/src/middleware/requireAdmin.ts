import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("Role: ", req.user?.role);
  console.log("Uid: ", req.user?.uid);
  console.log("User: ", req.user);
  try {
    if (!req.user || !req.user.uid) {
      res
        .status(401)
        .json({ error: "Unauthorized: Missing authentication context" });
      return;
    }

    const databaseUser = await prisma.user.findUnique({
      where: {
        firebaseUid: req.user.uid, // Using camelCase based on your working Prisma client schema
      },
    });

    if (!databaseUser || databaseUser.role !== "admin") {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    (req as any).dbUser = databaseUser;

    next();
  } catch (error) {
    console.error("Admin Authorization Middleware Error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error: Authorization check failed." });
  }
}
