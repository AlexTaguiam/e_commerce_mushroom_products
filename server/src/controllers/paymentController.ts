import { Request, Response } from "express";
import prisma from "../config/db";
import paymongo from "../config/paymongo";

export const createPaymentIntent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { order_id } = req.body as { order_id: number };
  const uid = req.user!.uid;

  if (!order_id) {
    res.status(400).json({ error: "order_id is required" });
    return;
  }

  try {
    // Step A: fetch + validate the order — plain Prisma, nothing new here
    const order = await prisma.order.findUnique({
      where: { orderId: order_id },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (order.userId !== uid) {
      res.status(403).json({ error: "This order does not belong to you" });
      return;
    }

    if (order.paymentMethod !== "paymongo") {
      res
        .status(400)
        .json({ error: "This order is not set up for online payment" });
      return;
    }

    if (order.paymentStatus === "paid") {
      res.status(400).json({ error: "This order has already been paid" });
      return;
    }

    // Step B: create the Payment Intent — amount is in centavos, so ₱250.00 -> 25000

    const amountInCentavos = Math.round(Number(order.totalAmount) * 100);

    const { data: intentRes } = await paymongo.post("/payment_intents", {
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: "PHP",
          payment_method_allowed: ["gcash", "card"],
          payment_method_options: {
            card: { request_three_d_secure: "automatic" },
          },
          capture_type: "automatic",
          metadata: { order_id: String(order.orderId) },
        },
      },
    });
    const paymentIntent = intentRes.data;

    // Step C: create a GCash Payment Method
    const { data: methodRes } = await paymongo.post("/payment_methods", {
      data: { attributes: { type: "gcash" } },
    });
    const paymentMethod = methodRes.data;

    // Step D: attach — this is the call that actually returns the checkout URL
    const { data: attachRes } = await paymongo.post(
      `/payment_intents/${paymentIntent.id}/attach`,
      {
        data: {
          attributes: {
            payment_method: paymentMethod.id,
            return_url: `${process.env.CLIENT_URL}/orders/${order.orderId}/payment-result`,
          },
        },
      },
    );
    const attached = attachRes.data;
    const checkoutUrl = attached.attributes.next_action?.redirect?.url;

    // Step E: save the PayMongo intent id so the webhook can find this
    // order later — update, not create, since Payment already exists (1:1)
    await prisma.payment.update({
      where: { orderId: order.orderId },
      data: { transactionRef: paymentIntent.id },
    });

    res.status(200).json({
      checkout_url: checkoutUrl,
      payment_intent_id: paymentIntent.id,
      client_key: attached.attributes.client_key,
    });
    return;
  } catch (error: any) {
    console.error(
      "createPaymentIntent error:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to create payment intent" });
    return;
  }
};
