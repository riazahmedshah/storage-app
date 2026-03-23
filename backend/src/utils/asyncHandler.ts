import { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler = (
  requestHandler: RequestHandler<any, any, any, any>)
  : RequestHandler => {
  return (req:Request, res:Response, next:NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  }
}