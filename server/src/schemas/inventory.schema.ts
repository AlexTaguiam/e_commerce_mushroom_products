import { z } from "zod";

/**
 * Schema for POST /api/inventory/restock
 *
 * productId is a Prisma Int (autoincrement).
 * quantity must be a positive integer (restocking always adds stock).
 * reason is optional — defaults to "Standard stock replenishment" in the controller.
 */
export const restockProductSchema = z.object({
  body: z
    .object({
      productId: z
        .number({ message: "productId must be a number" })
        .int("productId must be a whole number")
        .positive("productId must be a positive integer"),

      quantity: z
        .number({ message: "quantity must be a number" })
        .int("quantity must be a whole number")
        .positive("quantity must be greater than 0"),

      reason: z
        .string()
        .max(500, "reason must be 500 characters or fewer")
        .optional(),
    })
    .strict(),
});

/**
 * Schema for POST /api/inventory/adjust
 *
 * adjustment is a signed integer delta (positive = add, negative = reduce).
 * Zero is rejected — a no-op adjustment is likely a client mistake.
 * Business-logic guard (stock can't go negative) stays in the controller.
 */
export const adjustInventorySchema = z.object({
  body: z
    .object({
      productId: z
        .number({ message: "productId must be a number" })
        .int("productId must be a whole number")
        .positive("productId must be a positive integer"),

      adjustment: z
        .number({ message: "adjustment must be a number" })
        .int("adjustment must be a whole number")
        .refine((n) => n !== 0, { message: "adjustment cannot be zero" }),

      reason: z
        .string()
        .max(500, "reason must be 500 characters or fewer")
        .optional(),
    })
    .strict(),
});

export type RestockProductBody = z.infer<typeof restockProductSchema>["body"];
export type AdjustInventoryBody = z.infer<typeof adjustInventorySchema>["body"];

