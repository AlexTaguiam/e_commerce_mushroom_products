import { Response } from "express";
/**
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Human-readable message
 * @param {Any} data - The actual payload (array or object)
 */

/**
 * Sends a standardized JSON API response.
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null,
): Response => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  });
};
