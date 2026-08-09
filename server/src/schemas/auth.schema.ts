import { z } from "zod";

/**
 * Schema for POST /api/auth/sync
 *
 * All three body fields are optional — the endpoint is valid with an empty body.
 * When provided, each field is validated to match the same rules as the previous
 * manual guards in auhtController.ts (isValidName / isValidPhone / isValidAddress).
 *
 * phone: union of "" (explicit clear) | valid E.164-ish pattern — per Q3.
 * address: z.string().max(300) — allows "" as an intentional "clear" signal — per Q2.
 */
export const syncUserSchema = z.object({
  body: z
    .object({
      name: z
        .string({ message: "name must be a string" })
        .trim()
        .min(1, "name cannot be blank")
        .max(100, "name must be 100 characters or fewer")
        .optional(),

      phone: z
        .union([
          z.literal(""),
          z
            .string()
            .regex(
              /^\+?[0-9]{7,15}$/,
              "phone must be a valid number (7–15 digits, optional leading +)",
            ),
        ])
        .optional(),

      address: z
        .string({ message: "address must be a string" })
        .max(300, "address must be 300 characters or fewer")
        .optional(),
    })
    .strict(),
});

export type SyncUserBody = z.infer<typeof syncUserSchema>["body"];

