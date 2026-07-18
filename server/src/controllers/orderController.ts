import { Request, Response } from "express";
import prisma from "../config/db";

// 1. Explicitly type the structure of incoming items for compile safety
interface OrderItemInput {
  productId: number;
  quantity: number;
}

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Ensure the user context has been successfully verified via authentication middleware
    if (!req.user || !req.user.uid) {
      res
        .status(401)
        .json({ error: "Unauthorized: Invalid authentication session." });
      return;
    }

    // Gets the data coming from the frontend and defining its datatypes
    const {
      items,
      deliveryAddress,
      contactPhone,
      paymentMethod,
      fulfillmentType,
    } = req.body as {
      items: OrderItemInput[];
      deliveryAddress: string;
      contactPhone: string;
      paymentMethod: string;
      fulfillmentType: string;
    };

    // Checks the item if its not empty
    if (!items || items.length === 0) {
      res
        .status(400)
        .json({ error: "Bad Request: Your checkout cart cannot be empty." });
      return;
    }

    // Look up the database for the uid
    const databaseUser = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
    });

    if (!databaseUser) {
      res
        .status(404)
        .json({ error: "Not Found: User record could not be resolved." });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      let computedTotalAmount = 0;
      const verifiedItemDetails = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { productId: item.productId },
        });

        if (!product) {
          res.status(404).json({ error: "Product not found" });
          return;
        }

        if (
          product.status !== "active" ||
          product.stockQuantity <= item.quantity
        ) {
          res.status(400).json({ error: "Insufficint amount of stacks " });
          return;
        }

        const itemSubtotal = Number(product.price) * item.quantity;
        computedTotalAmount += itemSubtotal;

        verifiedItemDetails.push({
          productId: product.productId,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        });

        // await tx.product.update({
        //   where: { productId: product.productId },
        //   data: {
        //     stockQuantity: product.stockQuantity - item.quantity,
        //     status:
        //       product.stockQuantity - item.quantity === 0
        //         ? "out_of_stock"
        //         : "active",
        //   },
        // });
      }

      const newOrder = await tx.order.create({
        data: {
          userId: databaseUser.firebaseUid,
          totalAmount: computedTotalAmount,
          status: "pending",
          fulfillmentType: fulfillmentType,
          deliveryAddress:
            fulfillmentType === "delivery"
              ? deliveryAddress || databaseUser.address || ""
              : null,
          paymentMethod: paymentMethod,
          paymentStatus: "unpaid",

          orderItems: {
            create: verifiedItemDetails.map((detail) => ({
              productId: detail.productId,
              quantity: detail.quantity,
              priceAtOrder: detail.priceAtPurchase,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      const paymentLog = await tx.payment.create({
        data: {
          orderId: newOrder.orderId,
          amount: computedTotalAmount,
          method: paymentMethod,
          status: "pending",
        },
      });
      return { order: newOrder, payment: paymentLog };
    });

    res.status(201).json({
      message: "Order Placed Successfully!",
      orderId: result?.order.orderId,
      totalAmount: result?.order.totalAmount,
      itemsCoumt: result?.order.orderItems.length,
      paymentStatus: result?.order.status,
    });
  } catch (error: any) {
    console.error(
      "Critical Transaction Checkout Failure: ",
      error.message || error,
    );
    res.status(400).json({
      error: "Checkout Transaction Interrupted",
      details:
        error.message ||
        "An unhandled exception occurred during transaction verification.",
    });
  }
};

// const databaseUser = await prisma.user.findUnique({
//   where: { firebaseUid: req.user.uid },
// });

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.uid) {
      res.status(401).json({
        error: "Unauthorized: Missing authentication token.",
      });
      return;
    }

    const { uid, role } = req.user;
    const { status } = req.query;

    const whereClause: any = {};

    if (role === "admin") {
      if (status) {
        whereClause.status = status;
      }
    } else {
      whereClause.userId = uid;

      if (status) {
        whereClause.status = status;
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          select: {
            quantity: true,
            priceAtOrder: true,
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        payment: {
          select: {
            method: true,
            status: true,
          },
        },
      },
      orderBy: {
        orderDate: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("Unable to get orders ", error.message || error);
    res.status(400).json({
      error: "Getting Orders Interrupted",
      details:
        error.message || "An unhandled exception occurred in getting orders.",
    });
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
): Promise<void> => {};

export const confirmOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {};

export const updateOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {};

export const cancelOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {};
