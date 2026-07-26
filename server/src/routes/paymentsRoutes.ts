// src/routes/paymentRoutes.ts
import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { requireAdmin } from "../middleware/requireAdmin";
import { createPaymentIntent } from "../controllers/paymentController";

const router = Router();

// POST /api/payments/create-intent
// Access: Owner — token required, ownership checked inside the controller
router.post("/create-intent", verifyFirebaseToken, createPaymentIntent);

export default router;
