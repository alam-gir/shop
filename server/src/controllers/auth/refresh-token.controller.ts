import { Response } from "express";
import { RequestWithUser } from "../../../@types/custom";
import asyncHandler from "../../lib/async-handler";
import { ApiError } from "../../lib/api-response-custom";
import { jwtVerify } from "../../lib/auth/jwt-verify";
import { JwtPayload } from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./../../lib/generate-tokens";
import prisma from "../../lib/prisma";
import {
  setAccessTokenToCookie,
  setRefreshTokenToCookie,
} from "../../lib/set-cookies";
import { userServices } from "../../lib/db-services/user.services";

export const refreshToken = asyncHandler(
  async (req: RequestWithUser, res: Response) => {
    try {
      const client_refresh_token = req.cookies?.refresh_token;
      if (!client_refresh_token)
        throw new ApiError(400, "Refresh token not found!");

      const decodedToken = jwtVerify(
        client_refresh_token,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as unknown as JwtPayload;
      if (!decodedToken) throw new ApiError(400, "Invallid Refresh token!");

      const user = await userServices.getByRefreshToken(client_refresh_token);
      if (!user) throw new ApiError(400, "Invalid Refresh token!");

      const refresh_token = generateRefreshToken(user.id);
      const access_token = generateAccessToken(user.profile);

      const newRefreshTokensArray = [...user.refreshTokens, refresh_token];

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshTokens: newRefreshTokensArray },
      });

      setRefreshTokenToCookie(res, refresh_token);
      setAccessTokenToCookie(res, access_token);

      return res.status(200).json({success: true, message: "Refresed tokens!"})
    } catch (error) {
      throw error;
    }
  }
);
