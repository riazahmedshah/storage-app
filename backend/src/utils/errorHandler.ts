import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = undefined;

  if (err.code === 121 && err.errInfo?.details) {
    statusCode = 400;
    message = "Database Validation Failed";
    
    const rules = err.errInfo.details.schemaRulesNotSatisfied || [];
    details = rules.map((rule: any) => {
      const properties = rule.propertyName 
        ? [rule.propertyName] 
        : rule.additionalProperties || [];

      return {
        operator: rule.operatorName,
        properties: properties,
        reason: rule.description || "Value does not match schema requirements"
      };
    });
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate field value entered: ${field}. Please use another value.`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Input Validation Failed";
    details = Object.values(err.errors).map((val: any) => ({
      property: val.path,
      reason: val.message
    }));
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};