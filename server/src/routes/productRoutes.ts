import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProductStatus,
  updateProduct,
  getFeaturedProducts,
} from "../controllers/productController";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken";
import { requireAdmin } from "../middleware/requireAdmin";
import { upload } from "../middleware/upload";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
} from "../schemas/product.schema";

const router = Router();

// customer endpoints
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);

// admin endpoints
router.post(
  "/",
  verifyFirebaseToken,
  requireAdmin,
  upload.single("image"),
  validate(createProductSchema),
  createProduct,
);

router.patch(
  "/:id",
  verifyFirebaseToken,
  requireAdmin,
  upload.single("image"),
  validate(updateProductSchema),
  updateProduct,
);

router.patch(
  "/:id/status",
  verifyFirebaseToken,
  requireAdmin,
  validate(updateProductStatusSchema),
  updateProductStatus,
);

export default router;

