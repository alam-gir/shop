import { NextFunction, Response } from "express";
import asyncHandler from "../lib/async-handler";
import { RequestWithUser } from "../../@types/custom";
import { ApiError } from "../lib/api-response-custom";

export const isAdmin = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (user?.role !== "ADMIN")
        throw new ApiError(403, "Admin route! not allowed");
      next();
    } catch (error) {
      throw error;
    }
  }
);
