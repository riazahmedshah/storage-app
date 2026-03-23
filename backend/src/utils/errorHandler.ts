import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Input Validation Failed";
    details = err.issues.map((e) => ({
      property: e.path.join("."), 
      reason: e.message
    }));
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};