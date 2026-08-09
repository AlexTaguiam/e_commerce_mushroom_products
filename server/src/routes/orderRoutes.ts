import { Router } from "express";

import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { requireAdmin } from "../middleware/requireAdmin";
import { validate } from "../middleware/validate";
import {
  cancelOrder,
  confirmOrder,
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import {
  createOrderSchema,
  confirmOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from "../schemas/order.schema";

const router = Router();

// customer endpoints
router.post("/", verifyFirebaseToken, validate(createOrderSchema), createOrder);
router.get("/", verifyFirebaseToken, getOrders);
router.get("/:id", verifyFirebaseToken, getOrderById);

// admin endpoints
router.patch("/:id/confirm", verifyFirebaseToken, requireAdmin, validate(confirmOrderSchema), confirmOrder);
router.patch(
  "/:id/status",
  verifyFirebaseToken,
  requireAdmin,
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);
router.patch("/:id/cancel", verifyFirebaseToken, requireAdmin, validate(cancelOrderSchema), cancelOrder);

export default router;

