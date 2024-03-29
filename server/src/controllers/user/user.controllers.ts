import { Request, Response } from "express";
import asyncHandler from "../../lib/async-handler";
import { RequestWithUser } from "../../../@types/custom";
import { userServices } from "../../lib/db-services/user.services";
import { ApiError } from "../../lib/api-response-custom";

export const userController = {
  getMe: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const { withCart, withProfile, withOrders, withReviews } = req.query;
    const options = {
      withCart: withCart === "true",
      withProfile: withProfile === "true",
      withOrders: withOrders === "true",
      withReviews: withReviews === "true",
    };
    const loggedUser = req.user;
    const user = await userServices.getById(loggedUser?.id!, options);
    return res.status(200).json({ user });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { withCart, withProfile, withOrders, withReviews } = req.query;
    const options = {
      withCart: withCart === "true",
      withProfile: withProfile === "true",
      withOrders: withOrders === "true",
      withReviews: withReviews === "true",
    };

    const allUser = await userServices.getAll(options);
    if (!allUser) throw new ApiError(400, "No user found");
    return res.status(200).json({ allUser });
  }),
};
