// src/routes/paymentRoutes.ts
import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { createIntentForCart, createPaymentIntent, getPaymentStatus } from "../controllers/paymentController";
import { validate } from "../middleware/validate";
import { createIntentForCartSchema, createPaymentIntentSchema } from "../schemas/payment.schema";

const router = Router();

// POST /api/payments/create-intent
// Access: Owner — token required, ownership checked inside the controller
router.post("/create-intent", verifyFirebaseToken, validate(createPaymentIntentSchema), createPaymentIntent);
router.post("/create-intent-for-cart", verifyFirebaseToken, validate(createIntentForCartSchema), createIntentForCart);
router.get("/status/:paymentIntentId", verifyFirebaseToken, getPaymentStatus);

export default router;

