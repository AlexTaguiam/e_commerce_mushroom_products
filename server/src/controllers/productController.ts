import { Request, Response } from "express";
import prisma from "../config/db";
import cloudinary from "../config/cloudinary";
import { PRODUCT_CATEGORY, PRODUCT_STATUS } from "../constants/enums";

// --- GET ALL PRODUCTS ---
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const { category, status } = req.query;

    const products = await prisma.product.findMany({
      where: {
        ...(category && { category: String(category) }),
        ...(status && { status: String(status) }),
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

// --- GET PRODUCT BY ID ---
export async function getProductById(
  req: Request,
  res: Response,
): Promise<Response | void> {
  try {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const product = await prisma.product.findUnique({
      where: { productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error in getProductById for ID ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to retrieve the product" });
  }
}

// --- CREATE PRODUCT ---
export async function createProduct(
  req: Request,
  res: Response,
): Promise<Response | void> {
  try {
    const { name, description, category, price, unit, stockQuantity } =
      req.body;

    // Validate category
    if (category && !PRODUCT_CATEGORY.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    let imageUrl: string | undefined;

    // Cloudinary Image Upload
    if (req.file) {
      try {
        const uploadResult = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "mushroom_products" },
              (error, result) => {
                if (error || !result) {
                  reject(
                    error || new Error("Cloudinary upload returned no result."),
                  );
                } else {
                  resolve(result);
                }
              },
            );

            if (!req.file?.buffer) {
              reject(new Error("No file buffer found."));
            } else {
              stream.end(req.file.buffer);
            }
          },
        );
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res
          .status(500)
          .json({ error: "Image upload failed. Product creation aborted." });
      }
    }

    // Database Transaction
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name,
          description,
          category,
          price: Number(price), // Ensure numbers are stored, especially if sent via FormData
          unit,
          stockQuantity: Number(stockQuantity) || 0,
          imageUrl,
        },
      });

      if (created.stockQuantity > 0) {
        await tx.inventoryLog.create({
          data: {
            productId: created.productId,
            changeType: "stock_in",
            quantityChange: created.stockQuantity,
            reason: "Initial stock on product creation",
            adminId: (req as any).user?.uid, // Added safety cast in case req.user isn't on the base Express Request type
          },
        });
      }

      return created;
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
}

// --- UPDATE PRODUCT ---
export async function updateProduct(
  req: Request,
  res: Response,
): Promise<Response | void> {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const { name, description, category, price, unit, stockQuantity } =
      req.body;

    // Validate category if updating it
    if (category && !PRODUCT_CATEGORY.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    let imageUrl: string | undefined;

    // Cloudinary Image Upload
    if (req.file) {
      try {
        const uploadResult = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "mushroom_products" },
              (error, result) => {
                if (error || !result) {
                  reject(
                    error || new Error("Cloudinary upload returned no result."),
                  );
                } else {
                  resolve(result);
                }
              },
            );

            if (!req.file?.buffer) {
              reject(new Error("No file buffer found."));
            } else {
              stream.end(req.file.buffer);
            }
          },
        );
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed during update:", uploadError);
        return res
          .status(500)
          .json({ error: "Image upload failed. Update aborted." });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { productId },
      data: {
        name,
        description,
        category,
        price: price ? Number(price) : undefined,
        unit,
        stockQuantity:
          stockQuantity !== undefined ? Number(stockQuantity) : undefined,
        ...(imageUrl && { imageUrl }),
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error: any) {
    console.error(`Error in updateProduct for ID ${req.params.id}:`, error);

    // Check if error is due to product not existing in database (Prisma Code: P2025)
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found to update" });
    }

    res.status(500).json({ error: "Failed to update product" });
  }
}

// --- UPDATE PRODUCT STATUS ---
export async function updateProductStatus(
  req: Request,
  res: Response,
): Promise<Response | void> {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const { status } = req.body;

    if (!PRODUCT_STATUS.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const product = await prisma.product.update({
      where: { productId },
      data: { status },
    });

    res.status(200).json(product);
  } catch (error: any) {
    console.error(
      `Error in updateProductStatus for ID ${req.params.id}:`,
      error,
    );

    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ error: "Product not found to update status" });
    }

    res.status(500).json({ error: "Failed to update product status" });
  }
}
