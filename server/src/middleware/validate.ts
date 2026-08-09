import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware factory that validates req.body against a Zod schema.
 *
 * The schema should be structured as:
 *   z.object({ body: z.object({...}), params: z.object({...}).optional(), ... })
 *
 * On success:  req.body is replaced with the parsed/coerced result so Zod
 *              defaults and coercions (e.g. z.coerce.number()) reach controllers.
 * On ZodError: responds 400 with a flat list of field-level messages.
 * On other errors: passed to next(error) — not swallowed here.
 */
export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace req.body with the coerced/defaulted result from Zod
      // so controllers receive clean, correctly-typed values.
      if (parsed && typeof parsed === "object" && "body" in parsed) {
        req.body = (parsed as { body: unknown }).body;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          // Strip the leading "body" / "params" / "query" segment from the path
          field: issue.path.slice(1).join(".") || issue.path.join("."),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors: formattedErrors,
        });
        return;
      }

      // Non-validation errors bubble up to Express error handler
      next(error);
    }
  };
