import { z } from "zod";
import { PRODUCT_CATEGORY, PRODUCT_STATUS } from "../constants/enums";

/**
 * Schema for POST /api/products/ (create product)
 *
 * Fields arrive as multipart/form-data (Multer), so numeric fields are
 * strings on the wire — z.coerce.number() handles the conversion.
 * Image is in req.file, not req.body, so imageUrl is not validated here.
 */
export const createProductSchema = z.object({
  body: z
    .object({
      name: z
        .string({ message: "name is required" })
        .trim()
        .min(1, "name cannot be blank")
        .max(200, "name must be 200 characters or fewer"),

      description: z
        .string()
        .max(2000, "description must be 2000 characters or fewer")
        .optional(),

      category: z
        .enum(PRODUCT_CATEGORY, {
          message: `category must be one of: ${PRODUCT_CATEGORY.join(", ")}`,
        })
        .optional(),

      price: z.coerce
        .number({ message: "price must be a number" })
        .positive("price must be greater than 0"),

      unit: z
        .string({ message: "unit is required" })
        .trim()
        .min(1, "unit cannot be blank")
        .max(50, "unit must be 50 characters or fewer"),

      stockQuantity: z.coerce
        .number()
        .int("stockQuantity must be a whole number")
        .min(0, "stockQuantity cannot be negative")
        .default(0),
    })
    .strict(),
});

/**
 * Schema for PATCH /api/products/:id (update product)
 *
 * All body fields are optional — this is a partial update.
 * At least one field should be provided, but we don't enforce that at the
 * schema level (an empty PATCH is a no-op, not an error).
 */
export const updateProductSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "name cannot be blank")
        .max(200, "name must be 200 characters or fewer")
        .optional(),

      description: z
        .string()
        .max(2000, "description must be 2000 characters or fewer")
        .optional(),

      category: z
        .enum(PRODUCT_CATEGORY, {
          message: `category must be one of: ${PRODUCT_CATEGORY.join(", ")}`,
        })
        .optional(),

      price: z.coerce
        .number()
        .positive("price must be greater than 0")
        .optional(),

      unit: z
        .string()
        .trim()
        .min(1, "unit cannot be blank")
        .max(50, "unit must be 50 characters or fewer")
        .optional(),

      stockQuantity: z.coerce
        .number()
        .int("stockQuantity must be a whole number")
        .min(0, "stockQuantity cannot be negative")
        .optional(),
    })
    .strict(),

  params: z.object({
    id: z.coerce
      .number({ message: "Product ID must be a number" })
      .int()
      .positive("Product ID must be a positive integer"),
  }),
});

/**
 * Schema for PATCH /api/products/:id/status (update product status)
 */
export const updateProductStatusSchema = z.object({
  body: z
    .object({
      status: z.enum(PRODUCT_STATUS, {
        message: `status must be one of: ${PRODUCT_STATUS.join(", ")}`,
      }),
    })
    .strict(),

  params: z.object({
    id: z.coerce
      .number({ message: "Product ID must be a number" })
      .int()
      .positive("Product ID must be a positive integer"),
  }),
});

export type CreateProductBody = z.infer<typeof createProductSchema>["body"];
export type UpdateProductBody = z.infer<typeof updateProductSchema>["body"];
export type UpdateProductStatusBody = z.infer<
  typeof updateProductStatusSchema
>["body"];

