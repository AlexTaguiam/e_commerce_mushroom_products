import { Router } from "express";
import {
  getDashboardSummary,
  getRevenueOverview,
  getFulfillmentRatio,
  getRecentOrders,
  getLowStock,
} from "../controllers/dashboardController";
// import { requireAdmin } from "../middleware/auth"; // adjust to your actual admin-auth middleware

const router = Router();

// All routes below are admin-only — mount `requireAdmin` (or your existing
// admin auth middleware) once you've confirmed the import path.
// router.use(requireAdmin);

router.get("/summary", getDashboardSummary);
router.get("/revenue-overview", getRevenueOverview);
router.get("/fulfillment-ratio", getFulfillmentRatio);
router.get("/recent-orders", getRecentOrders);
router.get("/low-stock", getLowStock);

export default router;
