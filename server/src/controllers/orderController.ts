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
): Promise<void> => {
  try {
    if (!req.user || !req.user.uid) {
      res.status(401).json({
        error: "Unauthorized: Missing authentication token.",
      });
      return;
    }

    const { uid, role } = req.user;
    const { id } = req.params;
    const orderId = Number(id);

    console.log("Order ID:", orderId);

    if (isNaN(orderId)) {
      res.status(400).json({
        error: "Bad Request: Invalid format for target order ID identifier.",
      });
      return;
    }

    const whereClause: any = { orderId };

    if (role !== "admin") {
      whereClause.userId = uid;
    }

    const order = await prisma.order.findFirst({
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
    });

    if (!order) {
      res.status(404).json({
        error:
          "Not Found: The requested order record could not be resolved or access is restricted.",
      });
      return; // 👈 FIXED: Safely exits execution context
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error(
      "Unable to capture order profile logs:",
      error.message || error,
    );
    res.status(400).json({
      error: "Getting Order details Interrupted",
      details:
        error.message ||
        "An unhandled engine exception occurred while handling retrieval commands.",
    });
  }
};

export const confirmOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // 1. Guard Clause: Authenticate Session Context
    if (!req.user || !req.user.uid) {
      res
        .status(401)
        .json({ error: "Unauthorized: Missing authentication token." });
      return;
    }

    const { id } = req.params;
    const { role } = req.user;
    const orderId = Number(id);

    // Enforce role-based access control
    if (role !== "admin") {
      res.status(403).json({
        error: "Unauthorized: Only administrators can confirm orders.",
      });
      return;
    }

    // 2. Database Fetch: Secure the official order items directly from the database
    const targetOrder = await prisma.order.findUnique({
      where: { orderId },
      include: { orderItems: true }, // Pulls the official items array safely
    });

    // 3. State Guards: Verify order exists and is eligible for confirmation
    if (!targetOrder) {
      res
        .status(404)
        .json({ error: "Not Found: Target order could not be located." });
      return;
    }

    if (targetOrder.status !== "pending") {
      res.status(400).json({
        error: `Bad Request: Cannot confirm this order. Current status is already '${targetOrder.status}'.`,
      });
      return;
    }

    // 4. Initialize Database Isolation Transaction
    await prisma.$transaction(async (tx) => {
      // Loop through the secured order items fetched from step 2
      for (const item of targetOrder.orderItems) {
        // Fetch the up-to-the-second stock level of the target product
        const product = await tx.product.findUnique({
          where: { productId: item.productId },
        });

        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
        }

        // Concurrency Stock Check
        if (product.stockQuantity < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        }

        const updatedStock = product.stockQuantity - item.quantity;

        // Execute Product Stock Level Adjustment
        await tx.product.update({
          where: { productId: item.productId },
          data: {
            stockQuantity: updatedStock,
            status: updatedStock === 0 ? "out_of_stock" : "active",
          },
        });

        // Audit Trail Tracking: Create the inventory log entry (No 'where' clause here!)
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            changeType: "order_deduction",
            quantityChange: -item.quantity, // Stored as a negative value to reflect deduction
          },
        });
      }

      // 5. Final Lifecycle Writes: Update Main Order Lifecycle State
      await tx.order.update({
        where: { orderId },
        data: { status: "confirmed" },
      });

      // Optional: Update matching payment record if your schema uses a secondary tracker
      await tx.payment.updateMany({
        where: { orderId },
        data: { status: "confirmed" },
      });
    });

    // 6. Return Success Payload
    res.status(200).json({
      success: true,
      message: `Order #${orderId} confirmed successfully. Inventory stock levels updated.`,
    });
  } catch (error: any) {
    console.error("Unable to Confirm Order:", error.message || error);

    // Custom Error Router: Check if the transaction failed due to our explicit stock checks
    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const productName = error.message.split(":")[1];
      res.status(400).json({
        error: "Inventory Error",
        details: `Insufficient stock on hand for product: ${productName}. Transaction rolled back safely.`,
      });
      return;
    }

    if (error.message.startsWith("PRODUCT_NOT_FOUND:")) {
      res.status(404).json({
        error: "Inventory Error",
        details:
          "One or more items in the order point to a product that no longer exists.",
      });
      return;
    }

    // Standard Fallback catch-all for database drops or driver dropouts
    res.status(500).json({
      error: "Confirming Order Interrupted",
      details:
        error.message ||
        "An unhandled execution exception occurred inside the transaction database engine.",
    });
  }
};

export const updateOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {};

export const cancelOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {};
