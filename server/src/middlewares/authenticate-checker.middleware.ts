import { NextFunction, Request, Response } from "express";
import asyncHandler from "../lib/async-handler";
import { ApiError } from "../lib/api-response-custom";
import { jwtVerify } from "../lib/auth/jwt-verify";
import { JwtPayload } from "jsonwebtoken";
import { RequestWithUser } from "../../@types/custom";
import { userServices } from "../lib/db-services/user.services";
import { User, UserProfile } from "@prisma/client";

/**
 * this will push user data to req.user if user is authenticated
 */

export const checkAuthenticate = asyncHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) next();

    const decodedToken = jwtVerify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as unknown as JwtPayload;

    if (!decodedToken) next();

    const user = (await userServices.getById(decodedToken.userId, {
      withProfile: true,
    })) as User & { profile: UserProfile };

    req.user = user || null;

    next();
  }
);
