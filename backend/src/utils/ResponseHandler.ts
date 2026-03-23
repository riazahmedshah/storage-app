import { Response } from "express";

export class ResponseHandler {
  static success(
    res: Response,
    status = 200,
    message: string | null,
    data: any = null
  ) {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  }
}
