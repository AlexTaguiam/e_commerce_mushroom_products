import { Router } from "express";

import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { requireAdmin } from "../middleware/requireAdmin";
import { validate } from "../middleware/validate";
import {
  adjustInventory,
  getInventoryLogs,
  restockProduct,
} from "../controllers/inventoryController";
import {
  restockProductSchema,
  adjustInventorySchema,
} from "../schemas/inventory.schema";

const router = Router();

// ==============================
// Admin endpoints for inventory
// ==============================

// View inventory change history (filterable by ?product_id=)
router.get("/logs", verifyFirebaseToken, requireAdmin, getInventoryLogs);

// Restock a product (increments stock_quantity, inserts inventory_logs)
router.post(
  "/restock",
  verifyFirebaseToken,
  requireAdmin,
  validate(restockProductSchema),
  restockProduct,
);

// Manual adjustment (spoilage, damage, miscount)
router.post(
  "/adjust",
  verifyFirebaseToken,
  requireAdmin,
  validate(adjustInventorySchema),
  adjustInventory,
);

export default router;
