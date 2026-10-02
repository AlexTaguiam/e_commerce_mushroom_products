import { Router } from "express";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  exportSalesXml,
  getBestSellingProducts,
  getCustomerPurchaseSummary,
  getSalesSummary,
  getSalesTrends,
} from "../controllers/reportController";

const router = Router();
router.use(verifyFirebaseToken, requireAdmin);
router.get("/sales-summary", getSalesSummary);
router.get("/best-selling", getBestSellingProducts);
router.get("/customers", getCustomerPurchaseSummary);
router.get("/sales-trends", getSalesTrends);
router.get("/export/xml", exportSalesXml);

export default router;
