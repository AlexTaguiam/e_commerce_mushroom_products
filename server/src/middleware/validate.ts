import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

export const validate =
  (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body, query, and params simultaneously
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format issues cleanly into field-level error messages
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.slice(1).join(".") || issue.path.join("."), // strips top-level 'body' prefix
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors: formattedErrors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during validation.",
      });
    }
  };
