import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { sendContactMessage } from "../controllers/contactController";

const router = Router();

/**
 * @route   POST /api/auth/sync
 * @desc    Synchronize authenticated Firebase user data with the local PostgreSQL database
 * @access  Private (Requires valid Firebase Bearer Token)
 */

router.post("/contact", verifyFirebaseToken, sendContactMessage);

export default router;
