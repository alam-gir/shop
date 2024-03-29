import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../lib/api-response-custom";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const errorController = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log({ errorFromErrorController: error });
  if ((error as any).meta) {
    return res.status(400).json({
      success: false,
      message: (error as any).meta.cause,
      details: (error as any).meta.details,
      modelName: (error as any).meta.modelName,
    });
  } else if (error instanceof ApiError) {
    return res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  } else if (error instanceof Error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  return res
    .status(500)
    .json({ success: false, message: "Internal Server Error" });
};

export default errorController;
