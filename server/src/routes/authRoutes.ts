import { Router } from "express";
import { syncUser } from "../controllers/auhtController"; // Matches your file's typo 'auhtController'
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { authLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { syncUserSchema } from "../schemas/auth.schema";

const router = Router();

/**
 * @route   POST /api/auth/sync
 * @desc    Synchronize authenticated Firebase user data with the local PostgreSQL database
 * @access  Private (Requires valid Firebase Bearer Token)
 */
router.post("/sync", authLimiter, verifyFirebaseToken, validate(syncUserSchema), syncUser);

export default router;

