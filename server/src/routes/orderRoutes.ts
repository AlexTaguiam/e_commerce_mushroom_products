import { Router } from "express";

import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  cancelOrder,
  confirmOrder,
  createOrder,
  getOrderById,
  getOrders,
  updateOrder,
} from "../controllers/orderController";

const router = Router();

// customer endpoints
router.post("/", verifyFirebaseToken, createOrder);
router.get("/", verifyFirebaseToken, getOrders);
router.get("/:id", verifyFirebaseToken, getOrderById);

// admin endpoints
router.patch("/:id/confirm", verifyFirebaseToken, requireAdmin, confirmOrder);
router.patch("/:id/status", verifyFirebaseToken, requireAdmin, updateOrder);
router.patch("/:id/cancel", verifyFirebaseToken, requireAdmin, cancelOrder);

export default router;
