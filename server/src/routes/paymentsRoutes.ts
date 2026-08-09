// src/routes/paymentRoutes.ts
import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { createPaymentIntent } from "../controllers/paymentController";
import { validate } from "../middleware/validate";
import { createPaymentIntentSchema } from "../schemas/payment.schema";

const router = Router();

// POST /api/payments/create-intent
// Access: Owner — token required, ownership checked inside the controller
router.post("/create-intent", verifyFirebaseToken, validate(createPaymentIntentSchema), createPaymentIntent);

export default router;

