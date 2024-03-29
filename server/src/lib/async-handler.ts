import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from "../../@types/custom";

const asyncHandler = (
  fn: (
    req: Request | RequestWithUser,
    res: Response,
    next: NextFunction
  ) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
