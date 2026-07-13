import { Request, Response } from "express";
import prisma from "../config/db";
import cloudinary from "../config/cloudinary";
import { PRODUCT_CATEGORY, PRODUCT_STATUS } from "../constants/enums";

export async function getProducts(req: Request, res: Response) {
  const { category, status } = req.query;

  const products = await prisma.product.findMany({
    where: {
      ...(category && { category: String(category) }),
      ...(status && { status: String(status) }),
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(products);
}

export async function getProductById(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { productId: Number(req.params.id) },
  });

  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
}

export async function createProduct(req: Request, res: Response) {
  const { name, description, category, price, unit, stockQuantity } = req.body;

  if (category && !PRODUCT_CATEGORY.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  let imageUrl: string | undefined;

  if (req.file) {
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "mushroom_products" },
        (error, result) => (error ? reject(error) : resolve(result)),
      );
      stream.end(req.file!.buffer);
    });
    imageUrl = uploadResult.secure_url;
  }

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name,
        description,
        category,
        price,
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
          adminId: req.user?.uid,
        },
      });
    }

    return created;
  });

  res.status(201).json(product);
}

export async function updateProductStatus(req: Request, res: Response) {
  const { status } = req.body;

  if (!PRODUCT_STATUS.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const product = await prisma.product.update({
    where: { productId: Number(req.params.id) },
    data: { status },
  });

  res.json(product);
}
