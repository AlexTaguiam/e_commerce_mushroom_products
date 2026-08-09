import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { sendContactMessage } from "../controllers/contactController";
import { validate } from "../middleware/validate";
import { sendContactMessageSchema } from "../schemas/contact.schema";

const router = Router();

/**
 * @route   POST /api/contact
 * @desc    Send a contact form message via email
 * @access  Private (Requires valid Firebase Bearer Token)
 */

router.post("/contact", verifyFirebaseToken, validate(sendContactMessageSchema), sendContactMessage);

export default router;

