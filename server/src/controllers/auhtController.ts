import { Request, Response } from "express";
import prisma from "../config/db";
import { ROLES } from "../constants/enums";

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  // Security Guard: req.user is extracted by your verifyFirebaseToken middleware
  if (!req.user) {
    res
      .status(401)
      .json({ error: "Unauthorized: Missing user authentication context" });
    return;
  }

  const { uid, email, name } = req.user;

  // Custom metadata fields optional on registration registration
  const { phone, address } = req.body;

  if (!email) {
    res.status(400).json({
      error: "Bad Request: Firebase account is missing a valid email address",
    });
    return;
  }

  try {
    // Prisma Upsert: Atomically handles creation or profile updates
    const databaseUser = await prisma.user.upsert({
      where: {
        firebaseUid: uid,
      },
      update: {
        // Only updates fields if values are supplied by the client request payload
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
      },
      create: {
        firebaseUid: uid,
        email: email,
        name: name || "",
        phone: phone || null,
        address: address || null,
        role: ROLES[0], // Defaults new signups to 'customer'
      },
    });

    res.status(200).json({
      message: "User identity successfully synchronized.",
      user: databaseUser,
    });
  } catch (error) {
    console.error("Prisma Auth Sync Error:", error);
    res.status(500).json({
      error: "Internal Server Error: Failed to synchronize user profile.",
    });
  }
};
