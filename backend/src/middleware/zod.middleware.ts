import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateReqBody = (schema: ZodObject) => {
  return async (req:Request, res:Response, next:NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  }
}