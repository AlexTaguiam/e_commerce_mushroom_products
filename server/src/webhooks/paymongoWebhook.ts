import { Router, Request, Response } from "express";
import express from "express";
import crypto from "crypto";
import type { Product } from "@prisma/client";
import prisma from "../config/db";

const router = Router();

class StockConflictButProceedError extends Error {
  constructor(public readonly productId: number) {
    super(`STOCK_CONFLICT:${productId}`);
    this.name = "StockConflictButProceedError";
  }
}

const verifySignature = (rawBody: string, signatureHeader: string, secret: string) => {
  const parts = Object.fromEntries(signatureHeader.split(",").map((pair) => pair.trim().split("=") as [string, string]));
  if (!parts.t || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${rawBody}`).digest("hex");
  const provided = parts.te || parts.li;
  if (!provided || expected.length !== provided.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    return false;
  }
};

type CartItem = { productId: number; quantity: number };
type PendingCheckout = NonNullable<Awaited<ReturnType<typeof prisma.pendingCheckout.findUnique>>>;

const createPaidOrderFromPending = async (
  pending: PendingCheckout,
  paymentIntentId: string,
  eventId: string,
  eventType: string,
  needsReview: boolean,
) => {
  const cartItems: CartItem[] = JSON.parse(pending.cartItemsJson);
  await prisma.$transaction(async (tx) => {
    const products: Product[] = [];
    for (const item of cartItems) {
      const product = await tx.product.findUnique({ where: { productId: item.productId } });
      if (!product) throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
      if (!needsReview && product.stockQuantity < item.quantity) {
        throw new StockConflictButProceedError(item.productId);
      }
      products.push(product);
    }

    const newOrder = await tx.order.create({
      data: {
        userId: pending.userId,
        contactPhone: pending.contactPhone,
        totalAmount: pending.totalAmount,
        status: needsReview ? "needs_review" : "pending",
        fulfillmentType: pending.fulfillmentType,
        deliveryAddress: pending.deliveryAddress,
        paymentMethod: pending.paymentMethod,
        paymentStatus: "paid",
        orderItems: {
          create: cartItems.map((item, index) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: products[index].price,
          })),
        },
      },
    });
    await tx.payment.create({
      data: {
        orderId: newOrder.orderId,
        method: pending.paymentMethod,
        amount: pending.totalAmount,
        status: "paid",
        transactionRef: paymentIntentId,
        paidAt: new Date(),
      },
    });
    await tx.pendingCheckout.delete({ where: { paymentIntentId } });
    await tx.webhookEvent.create({ data: { eventId, eventType } });
  });
};

router.post("/paymongo", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const signatureHeader = req.headers["paymongo-signature"] as string;
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET!;
  const rawBody = req.body.toString();
  if (!signatureHeader || !verifySignature(rawBody, signatureHeader, secret)) {
    console.error("Invalid PayMongo webhook signature", { hasSignatureHeader: Boolean(signatureHeader), webhookSecretConfigured: Boolean(secret) });
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  const event = JSON.parse(rawBody);
  const eventId = event.data.id;
  const eventType = event.data.attributes.type;
  const eventData = event.data.attributes.data;
  try {
    const existing = await prisma.webhookEvent.findUnique({ where: { eventId } });
    if (existing) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    switch (eventType) {
      case "payment.paid": {
        const paymentIntentId = eventData.attributes.payment_intent_id;
        if (!paymentIntentId) {
          console.error("payment.paid event missing payment_intent_id", eventId);
          res.status(200).json({ received: true });
          return;
        }
        const pending = await prisma.pendingCheckout.findUnique({ where: { paymentIntentId } });
        if (!pending) {
          const existingPayment = await prisma.payment.findUnique({ where: { transactionRef: paymentIntentId } });
          if (existingPayment) {
            await prisma.$transaction([
              prisma.payment.update({ where: { transactionRef: paymentIntentId }, data: { status: "paid", paidAt: new Date() } }),
              prisma.order.update({ where: { orderId: existingPayment.orderId }, data: { paymentStatus: "paid" } }),
              prisma.webhookEvent.create({ data: { eventId, eventType } }),
            ]);
            res.status(200).json({ received: true });
            return;
          }
          console.error("payment.paid: no PendingCheckout or existing Payment found for intent", paymentIntentId, eventId, eventData);
          res.status(200).json({ received: true });
          return;
        }
        try {
          await createPaidOrderFromPending(pending, paymentIntentId, eventId, eventType, false);
        } catch (err) {
          if (!(err instanceof StockConflictButProceedError)) throw err;
          console.error("STOCK CONFLICT — paid order created for manual review", eventId, err.productId);
          await createPaidOrderFromPending(pending, paymentIntentId, eventId, eventType, true);
        }
        res.status(200).json({ received: true });
        return;
      }
      case "payment.failed": {
        const paymentIntentId = eventData.attributes.payment_intent_id;
        if (paymentIntentId) {
          await prisma.pendingCheckout.deleteMany({ where: { paymentIntentId } });
        }
        await prisma.webhookEvent.create({ data: { eventId, eventType } });
        res.status(200).json({ received: true });
        return;
      }
      default:
        res.status(200).json({ received: true });
        return;
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

export default router;
