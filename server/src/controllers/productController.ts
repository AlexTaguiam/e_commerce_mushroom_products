import { Request, Response } from "express";
import prisma from "../config/db";
import cloudinary from "../config/cloudinary";
import { PRODUCT_CATEGORY, PRODUCT_STATUS } from "../constants/enums";
import { sendResponse } from "../utils/reponseHandler";

// --- GET FEATURED PRODUCTS ---
export async function getFeaturedProducts(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "active",
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    sendResponse(
      res,
      200,
      "Featured products retrieved successfully",
      products,
    );
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error);
    sendResponse(res, 500, "Failed to fetch featured products");
  }
}

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

    sendResponse(res, 200, "Products retrieved successfully", products);
  } catch (error) {
    console.error("Error in getProducts:", error);
    sendResponse(res, 500, "Failed to fetch products");
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
      return sendResponse(res, 400, "Invalid product ID format");
    }

    const product = await prisma.product.findUnique({
      where: { productId },
    });

    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }

    sendResponse(res, 200, "Product retrieved successfully", product);
  } catch (error) {
    console.error(`Error in getProductById for ID ${req.params.id}:`, error);
    sendResponse(res, 500, "Failed to retrieve the product");
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
      return sendResponse(res, 400, "Invalid category");
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
        return sendResponse(
          res,
          500,
          "Image upload failed. Product creation aborted.",
        );
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

    sendResponse(res, 201, "Product created successfully", product);
  } catch (error) {
    console.error("Error in createProduct:", error);
    sendResponse(res, 500, "Failed to create product");
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
      return sendResponse(res, 400, "Invalid product ID format");
    }

    const { name, description, category, price, unit, stockQuantity } =
      req.body;

    // Validate category if updating it
    if (category && !PRODUCT_CATEGORY.includes(category)) {
      return sendResponse(res, 400, "Invalid category");
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
        return sendResponse(res, 500, "Image upload failed. Update aborted.");
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

    sendResponse(res, 200, "Product updated successfully", updatedProduct);
  } catch (error: any) {
    console.error(`Error in updateProduct for ID ${req.params.id}:`, error);

    // Check if error is due to product not existing in database (Prisma Code: P2025)
    if (error.code === "P2025") {
      return sendResponse(res, 404, "Product not found to update");
    }

    sendResponse(res, 500, "Failed to update product");
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
      return sendResponse(res, 400, "Invalid product ID format");
    }

    const { status } = req.body;

    if (!PRODUCT_STATUS.includes(status)) {
      return sendResponse(res, 400, "Invalid status");
    }

    const product = await prisma.product.update({
      where: { productId },
      data: { status },
    });

    sendResponse(res, 200, "Product status updated successfully", product);
  } catch (error: any) {
    console.error(
      `Error in updateProductStatus for ID ${req.params.id}:`,
      error,
    );

    if (error.code === "P2025") {
      return sendResponse(res, 404, "Product not found to update status");
    }

    sendResponse(res, 500, "Failed to update product status");
  }
}
