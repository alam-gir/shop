import { Request, Response } from "express";
import asyncHandler from "../../lib/async-handler";
import { discountServices } from "../../lib/db-services/discount.services";

export const discountControllers = {
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
      brands,
      product_ids,
      category_ids,
    } = req.body;

    const discount = await discountServices.create({
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
      brands,
      product_ids: product_ids,
      category_ids: category_ids,
    });

    return res.status(201).json({ success: true, discount });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { active, products, categories, coupon, include, brand } = req.query;

    const discount = await discountServices.get({
      id,
      options: {
        active: active === undefined ? undefined : active === "true",
        products: products === undefined ? undefined : products === "true",
        categories:
          categories === undefined ? undefined : categories === "true",
        coupon: coupon === undefined ? undefined : coupon === "true",
        include: include as string | undefined,
        brand: brand as string | undefined,
      },
    });

    return res.status(200).json({ success: true, discount });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { active, products, categories, coupon, include, brand } = req.query;

    const discounts = await discountServices.getAll({
      active: active === undefined ? undefined : active === "true",
      products: products === undefined ? undefined : products === "true",
      categories: categories === undefined ? undefined : categories === "true",
      coupon: coupon === undefined ? undefined : coupon === "true",
      include: include as string | undefined,
      brand: brand as string | undefined,
    });

    return res.status(200).json({ success: true, discounts });
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
      brands,
      product_ids,
      category_ids,
    } = req.body;

    const discount = await discountServices.update({
      id: id,
      data: {
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
        brands,
        product_ids,
        category_ids,
      },
    });

    return res.status(200).json({ success: true, discount });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const discount = await discountServices.remove(id);

    return res.status(200).json({ success: true, discount });
  }),
};
