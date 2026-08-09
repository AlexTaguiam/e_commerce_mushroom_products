import { z } from "zod";

/**
 * Schema for POST /api/orders/ (create order)
 *
 * Key constraints:
 * - fulfillmentType is a strict enum: "delivery" | "pickup"
 * - paymentMethod is a strict enum: "cod" | "paymongo"
 * - items must be a non-empty array of { productId: Int, quantity: positive int }
 * - deliveryAddress is conditionally required when fulfillmentType === "delivery"
 * - contactPhone is NOT in this schema — it has no DB column and is rejected by
 *   .strict() (Q1: option c — surface the bug, don't silently drop it)
 */
export const createOrderSchema = z
  .object({
    body: z
      .object({
        fulfillmentType: z.enum(["delivery", "pickup"], {
          message: 'fulfillmentType must be "delivery" or "pickup"',
        }),

        paymentMethod: z.enum(["cod", "paymongo"], {
          message: 'paymentMethod must be "cod" or "paymongo"',
        }),

        items: z
          .array(
            z
              .object({
                productId: z
                  .number({ message: "items[].productId must be a number" })
                  .int("items[].productId must be a whole number")
                  .positive("items[].productId must be a positive integer"),

                quantity: z
                  .number({ message: "items[].quantity must be a number" })
                  .int("items[].quantity must be a whole number")
                  .positive("items[].quantity must be greater than 0"),
              })
              .strict(),
          )
          .min(1, "items cannot be empty — add at least one product"),

        deliveryAddress: z.string().min(1, "deliveryAddress cannot be blank").optional(),
      })
      .strict()
      .superRefine((data, ctx) => {
        // deliveryAddress is required when fulfillmentType is "delivery"
        if (data.fulfillmentType === "delivery" && !data.deliveryAddress) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["deliveryAddress"],
            message: "deliveryAddress is required when fulfillmentType is \"delivery\"",
          });
        }
      }),
  });

/**
 * Schema for PATCH /api/orders/:id/status (update order status)
 *
 * Only the values that the state machine ever accepts as a targetStatus are
 * allowed. "pending", "confirmed", "cancelled" etc. are never valid inputs —
 * rejecting them here gives a cleaner error than letting the switch fall through.
 */
export const updateOrderStatusSchema = z.object({
  body: z
    .object({
      status: z.enum(["ready", "out_for_delivery", "completed"], {
        message:
          'status must be one of: "ready", "out_for_delivery", "completed"',
      }),
    })
    .strict(),

  params: z.object({
    id: z.coerce
      .number({ message: "Order ID must be a number" })
      .int()
      .positive("Order ID must be a positive integer"),
  }),
});

/**
 * Schema for PATCH /api/orders/:id/confirm
 * No body — param-only validation to guard against non-numeric :id.
 */
export const confirmOrderSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ message: "Order ID must be a number" })
      .int()
      .positive("Order ID must be a positive integer"),
  }),
});

/**
 * Schema for PATCH /api/orders/:id/cancel
 * No body — param-only validation.
 */
export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ message: "Order ID must be a number" })
      .int()
      .positive("Order ID must be a positive integer"),
  }),
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>["body"];
export type UpdateOrderStatusBody = z.infer<
  typeof updateOrderStatusSchema
>["body"];

