import { Request, Response } from "express";
import asyncHandler from "../../lib/async-handler";
import { userServices } from "../../lib/db-services/user.services";

export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const refresh_token = req.cookies?.refresh_token;

    await userServices.removeRefreshToken(refresh_token);

    res.clearCookie("refresh_token");
    res.clearCookie("access_token");
    res.clearCookie("cart_id");

    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    return res.status(200).json({ error: (error as any).message });
  }
});
