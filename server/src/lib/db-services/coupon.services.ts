import { CouponProps } from "../../types/types";
import { ApiError } from "../api-response-custom";
import prisma from "../../lib/prisma";
import { Category, Discount, Product } from "@prisma/client";

type CouponQueryOptions = {
  discount?: boolean;
  discountProducts?: boolean;
  discountCategories?: boolean;
  include?: string;
  active?: boolean;
};

export const couponServices = {
  create: async (props: CouponProps) => {
    try {
      if (!props.couponCode) throw new ApiError(400, "Coupon code is required");
      if (!props.percentage && !props.amount)
        throw new ApiError(400, "Percentage or amount is required");

      const discount = await prisma.discount.create({
        data: {
          name: "coupon",
          description: props.description,
          percentage: props.percentage,
          amount: props.amount,
          uptoLimit: props.uptoLimit,
          minimumOrderAmount: props.minimumOrderAmount,
          startDate: props.startDate,
          endDate: props.endDate,
          subDiscount:
            props.subDiscount === undefined ? false : props.subDiscount,
          active: props.active === undefined ? true : props.active,
          products: {
            connect: props.product_ids?.map((id) => ({ id })),
          },
          categories: {
            connect: props.category_ids?.map((id) => ({ id })),
          },
          coupon: {
            create: {
              code: props.couponCode,
              active: props.active === undefined ? true : props.active,
              limit: props.limit ? props.limit : 0,
            },
          },
        },
        include: {
          coupon: { include: { discount: true } },
        },
      });

      return discount.coupon;
    } catch (error) {
      throw error;
    }
  },

  get: async (id: string, options?: CouponQueryOptions) => {
    try {
      if (!id) throw new ApiError(400, "Id is required");

      return (await prisma.coupon.findUnique({
        where: { id },
        include: options?.discount
          ? {
              discount: {
                include: {
                  products: options?.discountProducts,
                  categories: options?.discountCategories,
                },
              },
            }
          : {},
      })) as
        | (CouponProps & {
            discount: Discount & {
              products: Product[];
              categories: Category[];
            };
          })
        | null;
    } catch (error) {
      throw error;
    }
  },

  getAll: async (options?: CouponQueryOptions) => {
    try {
      return await prisma.coupon.findMany({
        where: {
          AND: [
            options?.include
              ? {
                  code: {
                    contains: options?.include,
                    mode: "insensitive",
                  },
                }
              : {},
            options?.active === true || options?.active === false
              ? {
                  active: options?.active,
                }
              : {},
          ],
        },
        include: options?.discount
          ? {
              discount: {
                include: {
                  products: options?.discountProducts,
                  categories: options?.discountCategories,
                },
              },
            }
          : {},
      });
    } catch (error) {
      throw error;
    }
  },

  update: async ({ id, data }: { id: string; data: CouponProps }) => {
    try {
      if (!id) throw new ApiError(400, "Id is required");
      if (!data.couponCode) throw new ApiError(400, "Coupon Code is required");
      if (!data.percentage && !data.amount)
        throw new ApiError(400, "Percentage or amount is required");

      const oldCoupon = await couponServices.get(id, {
        discount: true,
        discountProducts: true,
        discountCategories: true,
      });

      console.log({ oldCoupon })

      const oldProductIds = oldCoupon?.discount.products?.map((product) => {
        return product.id;
      });

      const oldCategoryIds = oldCoupon?.discount.categories?.map((category) => {
        return category.id;
      });

      const disconnectProductIds = oldProductIds?.filter((id) => {
        return !data.product_ids?.includes(id);
      });
      const connectProductIds = data.product_ids?.filter((id) => {
        return !oldProductIds?.includes(id);
      });

      const disconnectCategoryIds = oldCategoryIds?.filter((id) => {
        return !data.category_ids?.includes(id);
      });
      const connectCategoryIds = data.category_ids?.filter((id) => {
        return !oldCategoryIds?.includes(id);
      });

      const coupon = await prisma.coupon.update({
        where: { id },
        data: {
          code: data.couponCode,
          limit: data.limit,
          active: data.active === undefined ? true : data.active,
          discount: {
            update: {
              description: data.description,
              percentage: data.percentage,
              amount: data.amount,
              uptoLimit: data.uptoLimit,
              minimumOrderAmount: data.minimumOrderAmount,
              startDate: data.startDate,
              endDate: data.endDate,
              subDiscount:
                data.subDiscount === undefined ? false : data.subDiscount,
              active: data.active === undefined ? true : data.active,
              products: {
                connect: connectProductIds?.map((id) => ({ id })),
                disconnect: disconnectProductIds?.map((id) => ({ id })),
              },
              categories: {
                connect: connectCategoryIds?.map((id) => ({ id })),
                disconnect: disconnectCategoryIds?.map((id) => ({ id })),
              },
            },
          },
        },
        include: {
          discount: true,
        },
      });

      return coupon;
    } catch (error) {
      throw error;
    }
  },

  countUse: async (couponId: string) => {
    try {
      if (!couponId) throw new ApiError(400, "Coupon id is required");

      return await prisma.coupon.update({
        where: { id: couponId },
        data: {
          usedTimes: { increment: 1 },
        },
      });
    } catch (error) {
      throw error;
    }
  },

  remove: async (id: string) => {
    try {
      if (!id) throw new ApiError(400, "Id is required");

      const coupon = await couponServices.get(id, { discount: true });

      if (!coupon) throw new ApiError(404, "Coupon not found");

      return await prisma.$transaction([
        prisma.coupon.delete({ where: { discountId: coupon.discount.id } }),
        prisma.discount.delete({ where: { id: coupon.discount.id } }),
      ]);
    } catch (error) {
      console.log({ error });
      throw error;
    }
  },
};
