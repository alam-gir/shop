import { Request, Response } from "express";
import { ApiError } from "../../lib/api-response-custom";
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
import { User, UserProfile } from "@prisma/client";
import { manageCartAtLogin } from "../../lib/db-services/cart.services";

export const credentialLogin = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      if (!email || !password)
        throw new ApiError(400, "Email and password are required");

      // check user exist
      const isExist = (await userServices.getByEmail(email, {
        forAdmin: true,
        withProfile: true,
      })) as User & { profile: UserProfile };

      if (!isExist) throw new ApiError(400, "Invalid credentials!");

      // check if user is registered with provider
      if (!isExist.password)
        throw new ApiError(400, "This mail is registered with a provider!");

      // check password
      const isPasswordMatch = await userServices.isPasswordValid(
        password,
        isExist?.password
      );
      if (!isPasswordMatch) throw new ApiError(400, "Invalid credentials!");

      // generate tokens
      const refresh_token = generateRefreshToken(isExist?.id);
      const access_token = generateAccessToken(isExist?.profile);

      if (!refresh_token || !access_token)
        throw new ApiError(400, "Token generation failed");

      // update refresh token in db
      await userServices.addRefreshToken(isExist.id, refresh_token);

      // set tokens to cookies
      setRefreshTokenToCookie(res, refresh_token);
      setAccessTokenToCookie(res, access_token);

      console.log("isExist", isExist)

      // manage cart merging 
      await manageCartAtLogin(req, res, { user_cart_id: isExist.cartId! });

      // send response
      return res.status(200).json({ userProfile: isExist.profile });
    } catch (error) {
      throw error;
    }
  }
);
