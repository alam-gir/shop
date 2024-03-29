import { DiscountProps } from "../../types/types";
import { ApiError } from "../api-response-custom";
import prisma from "../prisma";
import { Category, Discount, Prisma } from "@prisma/client";
import { categoryServices } from "./category.services";
import { productServices } from "./product.services";

type DiscountQueryOptions = {
  products?: boolean;
  categories?: boolean;
  coupon?: boolean;
  active?: boolean;
  include?: string;
  brand?: string;
};

export const discountServices = {
  create: async (props: DiscountProps) => {
    try {
      if (!props.name) throw new ApiError(400, "Name is required");
      if (!props.percentage && !props.amount)
        throw new ApiError(400, "Percentage or amount is required");

      const brands = props.brands?.map((brand) => brand.toLowerCase());

      const discount = await prisma.discount.create({
        data: {
          name: props.name,
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
          brands,
          products: {
            connect: props.product_ids?.map((id) => ({ id })),
          },
          categories: {
            connect: props.category_ids?.map((id) => ({ id })),
          },
        },
      });

      return discount;
    } catch (error) {
      throw error;
    }
  },

  get: async ({
    id,
    options,
  }: {
    id: string;
    options?: DiscountQueryOptions;
  }) => {
    try {
      if (!id) throw new ApiError(400, "Id is required");
      const { include, where } = getDiscountQuery(options || {});

      return await prisma.discount.findUnique({
        where: {
          id: id as string,
          AND: where.AND,
        },
        include,
      });
    } catch (error) {
      throw error;
    }
  },

  getAll: async (options?: DiscountQueryOptions) => {
    try {
      const { include, where } = getDiscountQuery(options || {});
      return await prisma.discount.findMany({
        where,
        include,
      });
    } catch (error) {
      throw error;
    }
  },

  update: async ({ id, data }: { id: string; data: DiscountProps }) => {
    try {
      if (!id) throw new ApiError(400, "Id is required");
      if (!data.name) throw new ApiError(400, "Name is required");
      if (!data.percentage && !data.amount)
        throw new ApiError(400, "Percentage or amount is required");

      const oldDiscount = await discountServices.get({
        id,
        options: { categories: true, products: true, coupon: true },
      });

      const oldProductIds = oldDiscount?.products?.map((product) => {
        return product.id;
      });

      const oldCategoryIds = oldDiscount?.categories?.map((category) => {
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

      const discount = await prisma.discount.update({
        where: { id },
        data: {
          name: data.name,
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
          brands: data.brands,
          products: {
            connect: connectProductIds?.map((id) => ({ id })),
            disconnect: disconnectProductIds?.map((id) => ({ id })),
          },
          categories: {
            connect: connectCategoryIds?.map((id) => ({ id })),
            disconnect: disconnectCategoryIds?.map((id) => ({ id })),
          },
        },
      });

      return discount;
    } catch (error) {
      throw error;
    }
  },

  findProductDiscount: async (productId: string) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { discount: true, category: true },
      });

      if (!product) throw new ApiError(404, "Product not found");

      let discount: Discount | null;

      discount = await discountServices.findCategoryDiscount(
        product.categoryId!
      );

      if (!discount) {
        if (
          product.discount?.active &&
          product.discount?.startDate <= new Date() &&
          product.discount?.endDate >= new Date()
        ) {
          discount = product.discount;
        }
      }

      return discount as Discount | null;
    } catch (error) {
      throw error;
    }
  },

  findCategoryDiscount: async (
    category_id: string
  ): Promise<null | Discount> => {
    try {
      const category = await categoryServices.getById(category_id, {
        discount: true,
        parent: true,
      });

      const now = new Date(); // Get the current date and time

      const start = new Date(category?.discount?.startDate);
      const end = new Date(category?.discount?.endDate);
      end.setDate(end.getDate() + 1);

      const isActive = category?.discount?.active;
      const isStarted = start <= now;
      const isEnded = end < now;

      if (isActive && isStarted && !isEnded) {
        return category.discount as Discount;
      } else {
        if (category?.parentId)
          return await discountServices.findCategoryDiscount(
            category?.parentId
          );
      }

      return null as Discount | null;
    } catch (error) {
      throw error;
    }
  },

  remove: async (id: string) => {
    if (!id) throw new ApiError(400, "Id is required");
    try {
      return await prisma.discount.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  },
};

const getDiscountQuery = (options: DiscountQueryOptions) => {
  const where: Prisma.DiscountWhereInput = {
    AND: [
      {
        OR: [
          options?.include
            ? { name: { contains: options?.include, mode: "insensitive" } }
            : {},
          options?.include
            ? {
                description: {
                  contains: options?.include,
                  mode: "insensitive",
                },
              }
            : {},
        ],
      },
      options?.active === true || options?.active === false
        ? {
            active: options?.active,
          }
        : {},
      options?.brand
        ? {
            brands: { has: options?.brand.toLowerCase() },
          }
        : {},
    ],
  };

  const include: Prisma.DiscountInclude = {
    products: options?.products,
    categories: options?.categories,
    coupon: options?.coupon,
  };

  return { where, include };
};
