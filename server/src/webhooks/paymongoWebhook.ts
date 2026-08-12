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

  console.log("expected:", expected);
  console.log("provided:", provided);
  console.log("secret used:", secret);

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

    console.log("=== WEBHOOK DEBUG ===");
    console.log("signatureHeader:", signatureHeader);
    console.log("secret (first 10 chars):", secret?.slice(0, 10));
    console.log("secret length:", secret?.length);

    if (
      !signatureHeader ||
      !verifySignature(rawBody, signatureHeader, secret)
    ) {
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody);
    const eventId = event.data.id; // top-level event id, distinct from the payment id
    const eventType = event.data.attributes.type;
    const eventData = event.data.attributes.data;

    try {
      const existing = await prisma.webhookEvent.findUnique({
        where: { eventId },
      });
      if (existing) {
        res.status(200).json({ received: true, duplicate: true });
        return;
      }

      switch (eventType) {
        case "payment.paid": {
          const orderIdRaw = eventData.attributes.metadata?.order_id;
          if (!orderIdRaw) {
            console.error(
              "payment.paid event missing order_id metadata",
              eventId,
            );
            break;
          }
          const orderId = Number(orderIdRaw);

          await prisma.$transaction([
            prisma.payment.update({
              where: { orderId },
              data: { status: "paid", paidAt: new Date() },
            }),
            prisma.order.update({
              where: { orderId },
              data: { paymentStatus: "paid" },
            }),
            prisma.webhookEvent.create({ data: { eventId, eventType } }),
          ]);
          break;
        }
        case "payment.failed": {
          const orderIdRaw = eventData.attributes.metadata?.order_id;
          const orderId = Number(orderIdRaw);
          await prisma.payment.update({
            where: { orderId },
            data: { status: "failed" },
          });
          await prisma.webhookEvent.create({ data: { eventId, eventType } });
          break;
        }
        default:
          break;
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Webhook processing error:", err);
      // still 200 if you don't want PayMongo hammering retries while you debug,
      // or 500 if you *want* retries once the idempotency check is in place
      res.status(500).json({ error: "Processing failed" });
    }
  },
);

export default router;
