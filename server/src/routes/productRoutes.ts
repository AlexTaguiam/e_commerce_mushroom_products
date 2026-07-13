import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProductStatus,
} from "../controllers/productController";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { requireAdmin } from "../middleware/requireAdmin";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  verifyFirebaseToken,
  requireAdmin,
  upload.single("image"),
  createProduct,
);
router.patch(
  "/:id/status",
  verifyFirebaseToken,
  requireAdmin,
  updateProductStatus,
);

export default router;
