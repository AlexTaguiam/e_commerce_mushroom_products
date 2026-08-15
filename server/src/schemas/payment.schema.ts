import { z } from "zod";

/**
 * Schema for POST /api/payment/create-intent
 *
 * order_id maps to the Prisma `orderId` Int column.
 * Must be a positive integer — not just truthy.
 *
 * NOTE: The PayMongo webhook (POST /webhooks/paymongo) is intentionally
 * excluded from Zod validation. It uses express.raw() for raw body access
 * required by HMAC signature verification — applying Zod there would break
 * the signature check.
 */

export const createPaymentIntentSchema = z.object({
  body: z
    .object({
      order_id: z
        .number({ message: "order_id must be a number" })
        .int("order_id must be a whole number")
        .positive("order_id must be a positive integer"),

      paymentMethod: z
        .enum(["gcash", "card", "paymongo"], {
          message: 'paymentMethod must be "gcash", "card", or "paymongo"',
        })
        .optional(),
    })
    .strict(),
});

export type CreatePaymentIntentBody = z.infer<
  typeof createPaymentIntentSchema
>["body"];

export const createIntentForCartSchema = z.object({
  body: z
    .object({
      fulfillmentType: z.enum(["delivery", "pickup"]),
      deliveryAddress: z.string().optional().transform((value) =>
        value?.trim() === "" ? undefined : value?.trim(),
      ),
      contactPhone: z
        .string()
        .regex(/^\+?[0-9]{7,15}$/, "contactPhone must be a valid phone number"),
      paymentMethod: z.enum(["gcash", "card"]),
      items: z
        .array(
          z
            .object({
              productId: z.number().int().positive(),
              quantity: z.number().int().positive(),
            })
            .strict(),
        )
        .min(1, "items cannot be empty — add at least one product"),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (data.fulfillmentType === "delivery" && !data.deliveryAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deliveryAddress"],
          message: "deliveryAddress is required when fulfillmentType is delivery",
        });
      }
    }),
});

export type CreateIntentForCartBody = z.infer<
  typeof createIntentForCartSchema
>["body"];
