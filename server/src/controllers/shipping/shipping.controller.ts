import { Request, Response } from "express";
import asyncHandler from "../../lib/async-handler";
import prisma from "../../lib/prisma";
import { ApiError } from "../../lib/api-response-custom";
import { shippingServices } from "../../lib/db-services/shipping.services";

export const shippingControllers = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { charge } = req.body;
    if (!charge || charge < 0) throw new ApiError(400, "Invalid charge");
    const shipping = await shippingServices.create(charge);
    res.status(201).json(shipping);
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const shipping = await shippingServices.get();
    res.status(200).json(shipping);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { charge } = req.body;
    if (!charge || charge < 0) throw new ApiError(400, "Invalid charge");
    const shipping = await shippingServices.update(charge);

    res.status(200).json(shipping);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, "Invalid id");
    const deletedShipping = await shippingServices.delete(id);
    res.status(200).json(deletedShipping);
  }),
};
