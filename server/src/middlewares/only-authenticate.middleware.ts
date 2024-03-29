import { NextFunction, Response } from "express";
import asyncHandler from "../lib/async-handler";
import { ApiError } from "../lib/api-response-custom";
import { jwtVerify } from "../lib/auth/jwt-verify";
import { JwtPayload } from "jsonwebtoken";
import { RequestWithUser } from "../../@types/custom";
import { userServices } from "../lib/db-services/user.services";
import { User } from "@prisma/client";

export const isAuthenticate = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "unathorized");

    const decodedToken = jwtVerify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as unknown as JwtPayload;

    if (!decodedToken) throw new ApiError(401, "unathorized!");

    const user = (await userServices.getById(decodedToken.userId, {
      forAdmin: true,
    })) as User ;

    if (!user) throw new ApiError(404, "user not found!");

    req.user = user;

    next();
  }
);
