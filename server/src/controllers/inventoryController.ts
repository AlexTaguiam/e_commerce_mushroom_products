import { Request, Response } from "express";
import prisma from "../config/db";
import { from } from "node:stream/iter";

/**
 * @route   GET /api/inventory/logs
 */
export const getInventoryLogs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user.uid) {
      res
        .status(401)
        .json({ error: "Unauthorized: Missing authentication token." });
      return;
    }

    const { role } = req.user;
    const { product_id: productId } = req.query;

    if (role !== "admin") {
      res
        .status(403)
        .json({ error: "Forbidden: Only administrators can view logs." });
      return;
    }

    const whereClause: any = {};
    if (productId) {
      whereClause.productId = Number(productId);
    }

    const logHistory = await prisma.inventoryLog.findMany({
      where: whereClause,
    });

    res.status(200).json({
      success: true,
      message: "Logs retrieved successfully.",
      data: logHistory,
    });
  } catch (error: any) {
    console.error("Error in getInventoryLogs:", error.message || error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message || "An unexpected error occurred.",
    });
  }
};

/**
 * @route   POST /api/inventory/restock
 */
export const restockProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // 1. Guard Clause: Authentication Check
    if (!req.user || !req.user.uid) {
      res
        .status(401)
        .json({ error: "Unauthorized: Missing authentication token." });
      return;
    }

    const { role, uid } = req.user;

    // 2. Guard Clause: Authorization Check (403 Forbidden is ideal here)
    if (role !== "admin") {
      res
        .status(403)
        .json({ error: "Forbidden: Administrative access required." });
      return;
    }

    const { productId, quantity, reason } = req.body;

    // 3. Input Validation Guard
    if (
      !productId ||
      quantity === undefined ||
      isNaN(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      res.status(400).json({
        error: "Bad Request",
        message:
          "A valid productId and a positive restock quantity are required.",
      });
      return;
    }

    // 4. Verify product exists before making alterations
    const currentProduct = await prisma.product.findUnique({
      where: { productId: Number(productId) },
      select: { productId: true }, // We only care if it exists, no need to fetch large payloads
    });

    if (!currentProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // 5. Execute Atomic Update & Nested Log Entry
    const updatedProduct = await prisma.product.update({
      where: { productId: Number(productId) },
      data: {
        stockQuantity: {
          increment: Number(quantity),
        },
        inventoryLogs: {
          create: {
            changeType: "RESTOCK",
            quantityChange: Number(quantity), // Logs the actual amount added safely
            reason: reason || "Standard stock replenishment",
            adminId: uid, // Note: Ensure your schema supports a String type if using Firebase UID strings
          },
        },
      },
      include: {
        inventoryLogs: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product restocked successfully.",
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error("Error in restockProduct:", error.message || error);
    res.status(500).json({
      error: "Internal Server Error",
      details:
        error.message ||
        "An unexpected error occurred during the restock operation.",
    });
  }
};

/**
 * @route   POST /api/inventory/adjust
 */
export const adjustInventory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("This is from adjust");

    // 1. Guard Clause: Authentication Check
    if (!req.user || !req.user.uid) {
      res
        .status(401)
        .json({ error: "Unauthorized: Missing authentication token." });
      return;
    }

    const { role, uid } = req.user;

    // 2. Guard Clause: Authorization Check (403 Forbidden is ideal here)
    if (role !== "admin") {
      res
        .status(403)
        .json({ error: "Forbidden: Administrative access required." });
      return;
    }

    const { productId, adjustment, reason } = req.body;

    if (
      !productId ||
      adjustment === undefined ||
      isNaN(Number(adjustment)) ||
      Number(adjustment) === 0
    ) {
      res.status(404).json({
        error:
          "A valid productId and a non-zero adjustment value are required.",
      });
      return;
    }

    const currentProduct = await prisma.product.findUnique({
      where: { productId: Number(productId) },
      select: { stockQuantity: true },
    });

    if (!currentProduct) {
      res.status(404).json({
        error: "Product not found",
      });
      return;
    }

    const currentStock = currentProduct.stockQuantity;
    const changeValue = Number(adjustment);

    if (currentStock + changeValue < 0) {
      res.status(400).json({
        error: "Bad Request",
        message: `Invalid adjustment. Current stock is ${currentStock}, cannot reduce by ${Math.abs(changeValue)}.`,
      });
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { productId: Number(productId) },
      data: {
        stockQuantity: {
          increment: changeValue,
        },
        inventoryLogs: {
          create: {
            changeType: "ADJUSTMENT",
            quantityChange: changeValue,
            reason: reason || "Administrative stock reconciliation",
            adminId: uid,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Inventory adjusted successfully.",
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error("Error in adjustInventory:", error.message || error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message || "An unexpected error occurred.",
    });
  }
};
