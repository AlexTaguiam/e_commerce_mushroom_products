import { z } from "zod";

/**
 * Schema for POST /api/contact
 *
 * name: required, max 100 chars (Q6)
 * email: required, must pass Zod's RFC-compliant email check
 * phone: optional — no storage, just forwarded in the email body
 * message: required, non-empty, max 2000 chars (Q5) to prevent abuse
 */
export const sendContactMessageSchema = z.object({
  body: z
    .object({
      name: z
        .string({ message: "name is required" })
        .trim()
        .min(1, "name cannot be blank")
        .max(100, "name must be 100 characters or fewer"),

      email: z
        .string({ message: "email is required" })
        .email("Please provide a valid email address"),

      phone: z
        .string()
        .max(50, "phone must be 50 characters or fewer")
        .optional(),

      message: z
        .string({ message: "message is required" })
        .min(1, "message cannot be blank")
        .max(2000, "message must be 2000 characters or fewer"),
    })
    .strict(),
});

export type SendContactMessageBody = z.infer<
  typeof sendContactMessageSchema
>["body"];

