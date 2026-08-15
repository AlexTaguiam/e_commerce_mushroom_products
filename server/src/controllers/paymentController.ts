import { Request, Response } from "express";
import prisma from "../config/db";
import paymongo from "../config/paymongo";
import { sendResponse } from "../utils/reponseHandler";

export const createPaymentIntent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // order_id & paymentMethod validated upstream or passed from request body
  const { order_id, paymentMethod } = req.body;
  const uid = req.user!.uid;

  try {
    // Step A: Fetch & validate order
    const order = await prisma.order.findUnique({
      where: { orderId: order_id },
    });

    if (!order) {
      sendResponse(res, 404, "Order not found");
      return;
    }

    if (order.userId !== uid) {
      sendResponse(res, 403, "This order does not belong to you");
      return;
    }

    // Allow gcash, card, or general paymongo methods
    const allowedOnlineMethods = ["gcash", "card", "paymongo"];
    if (!allowedOnlineMethods.includes(order.paymentMethod)) {
      sendResponse(res, 400, "This order is not set up for online payment");
      return;
    }

    if (order.paymentStatus === "paid") {
      sendResponse(res, 400, "This order has already been paid");
      return;
    }

    // Determine target payment method (prefer request body, fallback to order field)
    const targetMethod = paymentMethod || order.paymentMethod;
    const amountInCentavos = Math.round(Number(order.totalAmount) * 100);

    let checkoutUrl: string | undefined;
    let transactionRef: string;

    // Step B: Branch flow based on selected method
    if (targetMethod === "card") {
      // --- CARD FLOW (PayMongo Hosted Checkout Session for PCI Compliance) ---
      const { data: sessionRes } = await paymongo.post("/checkout_sessions", {
        data: {
          attributes: {
            amount: amountInCentavos,
            currency: "PHP",
            payment_method_types: ["card"],
            description: `Payment for Order #${order.orderId}`,
            line_items: [
              {
                amount: amountInCentavos,
                currency: "PHP",
                name: `Order #${order.orderId}`,
                quantity: 1,
              },
            ],
            cancel_url: `${process.env.CLIENT_URL}/checkout`,
            success_url: `${process.env.CLIENT_URL}/orders/${order.orderId}/payment-result`,
            metadata: { order_id: String(order.orderId) },
          },
        },
      });

      const session = sessionRes.data;
      checkoutUrl = session.attributes.checkout_url;
      // Store payment intent ID if generated, otherwise fallback to session ID
      transactionRef = session.attributes.payment_intent?.id || session.id;
    } else {
      // --- GCASH / DEFAULT FLOW (Payment Intent + Attached Payment Method) ---
      const { data: intentRes } = await paymongo.post("/payment_intents", {
        data: {
          attributes: {
            amount: amountInCentavos,
            currency: "PHP",
            payment_method_allowed: ["gcash"],
            capture_type: "automatic",
            metadata: { order_id: String(order.orderId) },
          },
        },
      });
      const paymentIntent = intentRes.data;

      // Create Payment Method
      const { data: methodRes } = await paymongo.post("/payment_methods", {
        data: { attributes: { type: "gcash" } },
      });
      const pm = methodRes.data;

      // Attach Payment Method
      const { data: attachRes } = await paymongo.post(
        `/payment_intents/${paymentIntent.id}/attach`,
        {
          data: {
            attributes: {
              payment_method: pm.id,
              return_url: `${process.env.CLIENT_URL}/orders/${order.orderId}/payment-result`,
            },
          },
        },
      );
      const attached = attachRes.data;
      checkoutUrl = attached.attributes.next_action?.redirect?.url;
      transactionRef = paymentIntent.id;
    }

    // Step C: Save transaction reference for webhooks
    await prisma.payment.update({
      where: { orderId: order.orderId },
      data: { transactionRef },
    });

    sendResponse(res, 200, "Payment session initialized successfully", {
      checkout_url: checkoutUrl,
      payment_intent_id: transactionRef,
    });
    return;
  } catch (error: any) {
    console.error(
      "createPaymentIntent error:",
      error.response?.data || error.message,
    );
    sendResponse(res, 500, "Failed to create payment intent");
    return;
  }
};

export const createIntentForCart = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    fulfillmentType,
    deliveryAddress,
    contactPhone,
    paymentMethod,
    items,
  } = req.body;
  const uid = req.user!.uid;

  try {
    let computedTotalAmount = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { productId: item.productId },
      });

      if (!product) {
        sendResponse(res, 400, `Product #${item.productId} was not found`);
        return;
      }

      if (product.status !== "active") {
        sendResponse(res, 400, `${product.name} is not currently available`);
        return;
      }

      if (product.stockQuantity < item.quantity) {
        sendResponse(res, 400, `Insufficient stock for ${product.name}`);
        return;
      }

      computedTotalAmount += Number(product.price) * item.quantity;
    }

    const databaseUser = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });
    if (!databaseUser) {
      sendResponse(res, 404, "Not Found: User record could not be resolved.");
      return;
    }

    const amountInCentavos = Math.round(computedTotalAmount * 100);
    const { data: intentRes } = await paymongo.post("/payment_intents", {
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: "PHP",
          payment_method_allowed: [paymentMethod],
          capture_type: "automatic",
          metadata: { pending: "true" },
        },
      },
    });
    const paymentIntent = intentRes.data;

    const { data: methodRes } = await paymongo.post("/payment_methods", {
      data: { attributes: { type: paymentMethod } },
    });
    const paymentMethodRecord = methodRes.data;

    const { data: attachRes } = await paymongo.post(
      `/payment_intents/${paymentIntent.id}/attach`,
      {
        data: {
          attributes: {
            payment_method: paymentMethodRecord.id,
            return_url: `${process.env.CLIENT_URL}/payment-result/${paymentIntent.id}`,
          },
        },
      },
    );

    await prisma.pendingCheckout.create({
      data: {
        paymentIntentId: paymentIntent.id,
        userId: databaseUser.firebaseUid,
        contactPhone,
        fulfillmentType,
        deliveryAddress:
          fulfillmentType === "delivery"
            ? deliveryAddress || databaseUser.address || ""
            : null,
        paymentMethod,
        totalAmount: computedTotalAmount,
        cartItemsJson: JSON.stringify(items),
      },
    });

    sendResponse(res, 200, "Payment session initialized successfully", {
      checkout_url: attachRes.data.attributes.next_action?.redirect?.url,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error: any) {
    console.error(
      "createIntentForCart error:",
      error.response?.data || error.message,
    );
    sendResponse(res, 500, "Failed to create payment intent");
  }
};

export const getPaymentStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paymentIntentId = Array.isArray(req.params.paymentIntentId)
    ? req.params.paymentIntentId[0]
    : req.params.paymentIntentId;
  const uid = req.user!.uid;

  try {
    const payment = await prisma.payment.findUnique({
      where: { transactionRef: paymentIntentId },
      include: { order: { select: { orderId: true, userId: true } } },
    });

    if (payment?.order.userId === uid) {
      sendResponse(res, 200, "Payment status retrieved", {
        status: "paid",
        orderId: payment.order.orderId,
      });
      return;
    }

    const pending = await prisma.pendingCheckout.findFirst({
      where: { paymentIntentId, userId: uid },
    });
    if (pending) {
      sendResponse(res, 200, "Payment is still processing", {
        status: "processing",
      });
      return;
    }

    sendResponse(res, 200, "Payment did not complete", { status: "failed" });
  } catch (error: any) {
    console.error("getPaymentStatus error:", error.message || error);
    sendResponse(res, 500, "Failed to retrieve payment status");
  }
};
