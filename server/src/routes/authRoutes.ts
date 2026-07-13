import { Router } from "express";
import { syncUser } from "../controllers/auhtController"; // Matches your file's typo 'auhtController'
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";

const router = Router();

/**
 * @route   POST /api/auth/sync
 * @desc    Synchronize authenticated Firebase user data with the local PostgreSQL database
 * @access  Private (Requires valid Firebase Bearer Token)
 */
router.post("/sync", verifyFirebaseToken, syncUser);

export default router;
