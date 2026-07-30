import { Request, Response } from "express";
import prisma from "../config/db";
import { ROLES } from "../constants/enums";
import { sendResponse } from "../utils/reponseHandler";

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  // Security Guard: verified token context validation wrapper
  if (!req.user) {
    sendResponse(res, 401, "Unauthorized: Missing user authentication context");
    return;
  }

  const { uid, email, name: firebaseName } = req.user;

  console.log("uid: ", uid);
  console.log("email: ", email);

  // Extract custom text fields out of the incoming JSON body payload
  const { name: bodyName, phone, address } = req.body;

  if (!email) {
    sendResponse(
      res,
      400,
      "Bad Request: Firebase account is missing a valid email address",
    );
    return;
  }

  // ⚡ Unify: Favor the form data body value, fall back to the token meta-strings
  const finalName = bodyName || firebaseName || "";

  try {
    // Prisma Upsert: Atomically handles creation or profile updates dynamically
    const databaseUser = await prisma.user.upsert({
      where: {
        firebaseUid: uid,
      },
      update: {
        // Prevents overwriting valid data with undefined if running a plain login sync
        name: finalName || undefined,
        phone: phone || undefined,
        address: address || undefined,
      },
      create: {
        firebaseUid: uid,
        email: email,
        name: finalName,
        phone: phone || null,
        address: address || null,
        role: ROLES[0], // Defaults new signup schemas to 'customer'
      },
    });

    sendResponse(
      res,
      200,
      "User identity successfully synchronized.",
      databaseUser,
    );
  } catch (error) {
    console.error("Prisma Auth Sync Error:", error);
    sendResponse(
      res,
      500,
      "Internal Server Error: Failed to synchronize user profile.",
    );
  }
};
