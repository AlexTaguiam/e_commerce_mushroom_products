import { Request, Response } from "express";
import prisma from "../config/db";
import { ROLES } from "../constants/enums";
import { sendResponse } from "../utils/reponseHandler";

// Basic guards — replace with zod/yup schema validation if you have one set up
const isValidName = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= 100;
const isValidPhone = (v: unknown): v is string =>
  typeof v === "string" && /^\+?[0-9]{7,15}$/.test(v);
const isValidAddress = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 300;

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    sendResponse(res, 401, "Unauthorized: Missing user authentication context");
    return;
  }

  const { uid, email, name: firebaseName } = req.user;
  const { name: bodyName, phone, address } = req.body;

  if (!email) {
    sendResponse(
      res,
      400,
      "Bad Request: Firebase account is missing a valid email address",
    );
    return;
  }

  // Validate any client-supplied fields before they touch the DB.
  // Reject rather than silently drop, so bad input doesn't fail invisibly.
  if (bodyName !== undefined && !isValidName(bodyName)) {
    sendResponse(res, 400, "Invalid name");
    return;
  }
  if (phone !== undefined && phone !== "" && !isValidPhone(phone)) {
    sendResponse(res, 400, "Invalid phone number");
    return;
  }
  if (address !== undefined && !isValidAddress(address)) {
    sendResponse(res, 400, "Invalid address");
    return;
  }

  // Prefer the verified token claim over client input for name —
  // client input is only a fallback for providers that don't supply a display name.
  const finalName = firebaseName || bodyName || "";

  try {
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    const databaseUser = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        name: finalName || undefined,
        phone: phone || undefined,
        address: address || undefined,
      },
      create: {
        firebaseUid: uid,
        email,
        name: finalName,
        phone: phone || null,
        address: address || null,
        role: ROLES[0],
      },
    });

    sendResponse(
      res,
      existingUser ? 200 : 201,
      existingUser
        ? "Logged in successfully."
        : "Account created successfully.",
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
