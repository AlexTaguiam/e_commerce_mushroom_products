import { Router, Request, Response } from "express";
import express from "express";
import crypto from "crypto";
import { buffer } from "stream/consumers";
import prisma from "../config/db";

const router = Router();
// ---- Layer 1: signature verification ----
const verifySignature = (
  rawBody: string,
  signatureHeader: string,
  secret: string,
) => {
  const parts = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((pair) => pair.split("=") as [string, string]),
  );

  const signedPayload = `${parts.t}.${rawBody}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  const provided = parts.te || parts.li;
  if (!provided) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(provided, "hex"),
    );
  } catch {
    return false;
  }
};
// ---- Layer 2: the route itself, using the function above ----
router.post(
  "/paymongo",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const signatureHeader = req.headers["paymongo-signature"] as string;
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET!;
    const rawBody = req.body.toString();

    if (
      !signatureHeader ||
      !verifySignature(rawBody, signatureHeader, secret)
    ) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.data.attributes.type;
    const eventData = event.data.attributes.data;

    try {
      switch (eventType) {
        case "payment_intent.succeeded": {
          const paymentIntentId = eventData.id;
          const payment = await prisma.payment.update({
            where: { transactionRef: paymentIntentId },
            data: { status: "paid", paidAt: new Date() },
          });

          await prisma.order.update({
            where: { orderId: payment.orderId },
            data: { paymentStatus: "paid" },
          });
          break;
        }
        case "payment_intent.payment_failed": {
          await prisma.payment.update({
            where: { transactionRef: eventData.id },
            data: { status: "failed" },
          });
          break;
        }
        default:
          break;
      }
    } catch {}
  },
);

export default router;
