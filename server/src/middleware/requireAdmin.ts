import { Request, Response, NextFunction } from "express";
import { User } from "@prisma/client";
import prisma from "../config/db";

// Extend Request to include dbUser without using `any`
export interface AuthenticatedAdminRequest extends Request {
  dbUser?: User;
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // 1. Verify authentication context exists
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or invalid authentication token.",
      });
    }

    // 2. Fetch user from database
    const databaseUser = await prisma.user.findUnique({
      where: {
        firebaseUid: req.user.uid,
      },
    });

    // 3. Strict role check (case-insensitive to prevent enum mismatch)
    if (!databaseUser || databaseUser.role?.toLowerCase() !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin privileges required.",
      });
    }

    // 4. Attach typed DB user to request
    (req as AuthenticatedAdminRequest).dbUser = databaseUser;

    return next();
  } catch (error) {
    // Log the internal error safely without exposing raw user context
    console.error("Admin Authorization Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error during authorization check.",
    });
  }
}
