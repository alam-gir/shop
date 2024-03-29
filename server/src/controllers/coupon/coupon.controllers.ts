import { Request, Response } from "express";
import asyncHandler from "./../../lib/async-handler";
import { couponServices } from "../../lib/db-services/coupon.services";

export const couponControllers = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      description,
      percentage,
      amount,
      uptoLimit,
      minimumOrderAmount,
      active,
      startDate,
      endDate,
      subDiscount,
      product_ids,
      category_ids,
      couponCode,
      limit,
    } = req.body;

    const coupon = await couponServices.create({
      couponCode: couponCode,
      limit: parseInt(limit),
      name,
      description,
      percentage: parseInt(percentage),
      amount: parseInt(amount),
      uptoLimit: parseInt(uptoLimit),
      minimumOrderAmount: parseInt(minimumOrderAmount),
      active: active === undefined ? true : active === "true",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      subDiscount:
        subDiscount === undefined
          ? undefined
          : subDiscount === "true" || subDiscount === true,
      product_ids: product_ids,
      category_ids: category_ids,
    });

    return res.status(201).json({ success: true, coupon });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { discount, products, categories, include, active } =
      req.query;

    const coupon = await couponServices.get(id, {
      discount: discount === "true",
      discountProducts: products === "true",
      discountCategories: categories === "true",
      include: include as string,
      active: active === undefined ? undefined : active === "true",
    });

    return res.status(200).json({ success: true, coupon });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { discount, products, categories, include, active } =
      req.query;

    const coupons = await couponServices.getAll({
      discount: discount === "true",
      discountProducts: products === "true",
      discountCategories: categories === "true",
      include: include as string,
      active: active === undefined ? undefined : active === "true",
    });

    return res.status(200).json({ success: true, coupons });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const {
      name,
      description,
      percentage,
      amount,
      uptoLimit,
      minimumOrderAmount,
      active,
      startDate,
      endDate,
      subDiscount,
      product_ids,
      category_ids,
      couponCode,
      limit,
    } = req.body;

    const coupon = await couponServices.update({
      id,
      data: {
        couponCode: couponCode,
        limit: parseInt(limit),
        name,
        description,
        percentage: parseInt(percentage),
        amount: parseInt(amount),
        uptoLimit: parseInt(uptoLimit),
        minimumOrderAmount: parseInt(minimumOrderAmount),
        active: active === undefined ? true : active === "true",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        subDiscount: subDiscount === undefined ? false : subDiscount === "true",
        product_ids: product_ids,
        category_ids: category_ids,
      },
    });

    return res.status(201).json({ success: true, coupon });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const coupon = await couponServices.remove(id);

    return res.status(200).json({ success: true, coupon });
  }),
};
