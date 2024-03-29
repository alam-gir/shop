import { Request, Response } from "express";
import { ApiError } from "../../lib/api-response-custom";
import { getAccessToken } from "./providers/get-provider-access-token";
import { getUserInfo } from "./providers/get-provider-user-info";
import prisma from "../../lib/prisma";
import { User, UserProfile } from "@prisma/client";
import asyncHandler from "../../lib/async-handler";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../lib/generate-tokens";
import {
  setAccessTokenToCookie,
  setRefreshTokenToCookie,
} from "../../lib/set-cookies";
import { userServices } from "../../lib/db-services/user.services";
import { setCartIdToCookie } from "../cart/cart.controllers";
import { manageCartAtLogin } from "../../lib/db-services/cart.services";

export const providerLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const { provider } = req.params;
    const { code } = req.query;

    try {
      if (!provider || !code)
        throw new ApiError(400, "Missing provider or code query parameter");

      const provider_access_token = await getAccessToken({
        provider: provider as string,
        code: code as string,
      });

      if (!provider_access_token)
        throw new ApiError(400, "Failed to fetch access token!");

      const userInfo = (await getUserInfo({
        access_token: provider_access_token as string,
        provider: provider as string,
      })) as any;

      if (!userInfo) throw new ApiError(400, "Failed to fetch user info!");

      let user = (await userServices.getByEmail(userInfo.email, {
        forAdmin: true,
        withProfile: true,
      })) as User & { profile: UserProfile };

      if (!user)
        user = (await userServices.create({
          name: userInfo?.name,
          email: userInfo?.email,
          avatar: userInfo?.picture,
        })) as User & { profile: UserProfile };

      const refresh_token = generateRefreshToken(user.id);
      const access_token = generateAccessToken(user.profile);

      if (!refresh_token || !access_token)
        throw new ApiError(400, "Token generation failed");

      // update refresh token in db
      await userServices.addRefreshToken(user.id, refresh_token);

      // set tokens to cookies
      setRefreshTokenToCookie(res, refresh_token);
      setAccessTokenToCookie(res, access_token);

      // manage cart merging
      await manageCartAtLogin(req, res, { user_cart_id: user.cartId! });

      return res.status(200).json({ userProfile: user.profile });
    } catch (error) {
      throw error;
    }
  }
);
