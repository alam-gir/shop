import { Request, Response } from "express";
import asyncHandler from "../../../lib/async-handler";
import { providers } from "./get-auth-url";

export const redirectToAuthUrl = asyncHandler(
  async (req: Request, res: Response) => {
    const { provider } = req.params;
    try {
      if (!provider) throw new Error("Missing provider query parameter");

      const redirectUrl = `${process.env.BASE_API_V1_URL}/auth/login/${provider}/callback`;
      let authUrl: string | undefined;

      switch (provider) {
        case "google":
          authUrl = providers.google.getAuthLink(redirectUrl);
          break;
        default:
          throw new Error("Invalid provider");
      }

      if (!authUrl) throw new Error("Auth url not found");
      console.log({ authUrl });
      return res.redirect(authUrl);
    } catch (error) {
      throw error;
    }
  }
);
