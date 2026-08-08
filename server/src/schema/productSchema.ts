import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Product name is required" })
      .min(3, "Name must be at least 3 characters"),
    price: z
      .number({ message: "Price is required" })
      .positive("Price must be greater than 0"),
    stock: z
      .number()
      .int("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .default(0),
    description: z.string().optional(),
    categoryId: z.string().uuid("Invalid category ID format"),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
