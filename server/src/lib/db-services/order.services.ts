import { cartServices } from "./cart.services";
import { shippingServices } from "./shipping.services";
import prisma from "../prisma";
import { ApiError } from "../api-response-custom";
import {
  GetOrderOptions,
  GetOrdersProps,
  PlaceOrderProp,
} from "../../types/types";
import { productServices } from "./product.services";
import { ORDERSTATUS, Prisma } from "@prisma/client";
import { paymentServices } from "./payment.services";

export const orderServices = {
  place: async ({
    response,
    userId,
    cart_id,
    shippingAddress,
    paymentInfo,
  }: PlaceOrderProp) => {
    try {
      const cart = await cartServices.get(cart_id);

      if (!cart || !cart.products?.length)
        throw new Error("Minimum one product required in cart!");

      // calculate order cost
      const price = cart.products.reduce(
        (acc, product) => {
          acc.total += product?.price! * product?.quantity!;
          acc.subTotal += product?.subTotalPrice! * product?.quantity!;
          return acc;
        },
        {
          total: 0, //  total base price
          subTotal: 0, // total offer price
        }
      );

      const tax = 0;
      const shipping = await shippingServices.get();
      const offer = price.total - price.subTotal;
      price.subTotal = price.subTotal + shipping?.charge! + tax;

      const orderPromise = prisma.order.create({
        data: {
          cart: {
            connect: { id: cart_id },
          },
          shippingAddress: {
            create: {
              ...shippingAddress,
            },
          },
          orderCost: {
            create: {
              total: price.total,
              offer,
              tax,
              shipping: shipping?.charge!,
              subTotal: price.subTotal,
            },
          },
          payment: {
            create: {
              amount: price.subTotal,
              method: paymentInfo.method,
              transactionId: paymentInfo.transactionId,
            },
          },
          status: {
            create: {},
          },
        },
        include: {
          cart: {
            include: {
              products: {
                include: {
                  product: true,
                  inventory: true,
                },
              },
            },
          },
        },
      });

      const inventoryUpdatePromises = cart?.products.map(async (product) => {
        const inventory = await productServices.inventory.get(
          product.inventory_id
        );
        const newQuantity = inventory?.quantity! - product.quantity;

        return productServices.inventory.update.qunatity({
          inventory_id: product.inventory_id,
          quantity: newQuantity,
        });
      });

      let order: any;
      let updatedInvetories: any;

      [order, ...updatedInvetories] = await Promise.all([
        orderPromise,
        ...inventoryUpdatePromises,
      ]);

      if (userId) {
        order = await prisma.order.update({
          where: { id: order.id },
          data: {
            user: {
              connect: { id: userId },
            },
          },
        });
      }

      // change the cart for clear
      await cartServices.changeCart(response!, userId);

      return order;
    } catch (error) {
      throw error;
    }
  },

  get: async (id: string, options?: GetOrderOptions) => {
    try {
      if (!id) throw new ApiError(400, "Order id is required");
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderCost: options?.orderCost,
          shippingAddress: options?.shippingAddress,
          status: options?.status,
          cart: {
            include: {
              products: {
                include: { inventory: options?.cart, product: options?.cart },
              },
            },
          },
          payment: options?.payment,
        },
      });

      return order;
    } catch (error) {
      throw error;
    }
  },

  getMy: async (options: GetOrdersProps) => {
    try {
      if (!options.user_id) throw new ApiError(400, "User id is required");
      const { where, include, orderBy } = getOrderFilterOptions(options);
      const orders = await prisma.order.findMany({
        where,
        include,
        orderBy,
      });
      return orders;
    } catch (error) {
      throw error;
    }
  },

  getAll: async (options: GetOrdersProps) => {
    try {
      const { where, include, orderBy } = getOrderFilterOptions(options);
      const orders = await prisma.order.findMany({
        where,
        orderBy,
        include,
        take: options.take,
        skip: options.skip,
      });

      const totalOrders = await prisma.order.count({ where });
      return {
        totalOrders,
        orders,
      };
    } catch (error) {
      throw error;
    }
  },

  updateStatus: {
    processing: async ({
      id,
      message,
    }: {
      id: string;
      message: string | undefined;
    }) => {
      try {
        const order = await orderServices.get(id, { cart: true, status: true });

        if (!order) throw new ApiError(400, "Order not found!");

        if (order?.status?.textCode === "PROCESSING")
          throw new ApiError(400, "Already in processing!");

        if (
          order?.status?.textCode === "CANCELLED" ||
          order?.status?.textCode === "COMPLETED" ||
          order?.status?.textCode === "RETURNED"
        )
          throw new ApiError(400, "Order is canceled | completed | returned!");

        const updatedOrder = await orderServices.updateStatus.update({
          orderId: order.id,
          status: "PROCESSING",
          message,
        });

        return updatedOrder;
      } catch (error) {
        throw error;
      }
    },

    shipping: async ({
      id,
      message,
    }: {
      id: string;
      message: string | undefined;
    }) => {
      try {
        const order = await orderServices.get(id, { cart: true, status: true });

        if (!order) throw new ApiError(400, "Order not found!");

        if (order?.status?.textCode === "SHIPPING")
          throw new ApiError(400, "Already in shipping!");

        if (order?.status?.textCode !== "PROCESSING")
          throw new ApiError(400, "Order havent in processing yet!");

        return await orderServices.updateStatus.update({
          orderId: order.id,
          status: "SHIPPING",
          message,
        });
      } catch (error) {
        throw error;
      }
    },

    shipped: async ({
      id,
      message,
    }: {
      id: string;
      message: string | undefined;
    }) => {
      try {
        const order = await orderServices.get(id, { cart: true, status: true });

        if (!order) throw new ApiError(400, "Order not found!");

        if (order?.status?.textCode === "SHIPPED")
          throw new ApiError(400, "Already shipped!");

        if (order?.status?.textCode !== "SHIPPING")
          throw new ApiError(400, "Order not in shipping!");

        return await orderServices.updateStatus.update({
          orderId: order.id,
          status: "SHIPPED",
          message,
        });
      } catch (error) {
        throw error;
      }
    },

    hold: async ({
      id,
      message,
    }: {
      id: string;
      message: string | undefined;
    }) => {},

    unHold: async ({
      id,
      message,
    }: {
      id: string;
      message: string | undefined;
    }) => {},

    complete: async ({
      id,
      message,
    }: {
      id: string;
      message: string | undefined;
    }) => {
      try {
        const order = await orderServices.get(id, {
          cart: true,
          status: true,
          payment: true,
        });

        if (!order) throw new ApiError(400, "Order not found!");

        if (order?.status?.textCode === "COMPLETED")
          throw new ApiError(400, "Already completed!");

        if (order?.status?.textCode !== "SHIPPED")
          throw new ApiError(400, "Order havent shipped yet!");

        const paymentUpdatePromise = paymentServices.makePaid(
          order.payment?.id!
        );
        const orderUpdatePromise = orderServices.updateStatus.update({
          orderId: order.id,
          status: "COMPLETED",
          message,
        });

        const [payment, updatedOrder] = await Promise.all([
          paymentUpdatePromise,
          orderUpdatePromise,
        ]);

        return updatedOrder;
      } catch (error) {
        throw error;
      }
    },

    return: async ({
      id,
      message,
    }: {
      id: string;
      message: string | undefined;
    }) => {
      try {
        const order = await orderServices.get(id, { cart: true, status: true });

        if (!order) throw new ApiError(400, "Order not found!");

        if (order?.status?.textCode === "RETURNED")
          throw new ApiError(400, "Already returned!");

        if (order?.status?.textCode !== "SHIPPED")
          throw new ApiError(400, "Order havent shipped yet!");

        const orderUpdatePromise = orderServices.updateStatus.update({
          orderId: order.id,
          status: "RETURNED",
          message,
        });

        const paymentUpdatePromise = paymentServices.makeCancel(
          order.payment?.id!
        );

        const inventoryUpdatePromises = order?.cart?.products.map(
          async (product) => {
            const inventory = await productServices.inventory.get(
              product.inventoryId
            );
            const newQuantity = inventory?.quantity! + product.quantity;

            return productServices.inventory.update.qunatity({
              inventory_id: product.inventoryId,
              quantity: newQuantity,
            });
          }
        );

        const [updatedOrder, updatedPayment, ...updatedInventory] =
          await Promise.all([
            orderUpdatePromise,
            paymentUpdatePromise,
            ...inventoryUpdatePromises,
          ]);

        return updatedOrder;
      } catch (error) {
        throw error;
      }
    },

    cancel: async ({
      id,
      message,
    }: {
      id: string;
      message: string | undefined;
    }) => {
      try {
        const order = await orderServices.get(id, { cart: true, status: true });

        if (!order) throw new ApiError(400, "Order not found!");

        if (order?.status?.textCode === "CANCELLED")
          throw new ApiError(400, "Already canceled!");

        const orderUpdatePromise = orderServices.updateStatus.update({
          orderId: order.id,
          status: "CANCELLED",
          message,
        });

        const paymentUpdatePromise = paymentServices.makeCancel(
          order.payment?.id!
        );

        const inventoryUpdatePromises = order?.cart?.products.map(
          async (product) => {
            const inventory = await productServices.inventory.get(
              product.inventoryId
            );
            const newQuantity = inventory?.quantity! + product.quantity;

            return productServices.inventory.update.qunatity({
              inventory_id: product.inventoryId,
              quantity: newQuantity,
            });
          }
        );

        // update the product inventory
        const [updatedOrder, updatedPayment, ...updatedInventory] =
          await Promise.all([
            orderUpdatePromise,
            paymentUpdatePromise,
            ...inventoryUpdatePromises,
          ]);

        return updatedOrder;
      } catch (error) {
        throw error;
      }
    },

    update: async ({
      orderId,
      status,
      message,
    }: {
      orderId: string;
      status: ORDERSTATUS;
      message: string | undefined;
    }) => {
      try {
        if (!orderId) throw new ApiError(400, "Order id is required");
        if (!status) throw new ApiError(400, "Status is required");

        return await prisma.order.update({
          where: { id: orderId },
          data: {
            status: {
              create: {
                textCode: status,
                message: message,
              },
            },
          },
          include: { status: true },
        });
      } catch (error) {
        throw error;
      }
    },
  },

  delete: async (id: string) => {
    try {
      if (!id) throw new ApiError(400, "Order id is required");
      const order = await prisma.order.delete({ where: { id } });

      return order;
    } catch (error) {
      throw error;
    }
  },
};

const getOrderFilterOptions = (options: GetOrdersProps) => {
  const where: Prisma.OrderWhereInput = {
    AND: [
      options?.include
        ? {
            OR: [
              {
                id: {
                  contains: options?.include,
                  mode: "insensitive",
                },
              },
              {
                shippingAddress: {
                  OR: [
                    {
                      address: {
                        contains: options?.include,
                        mode: "insensitive",
                      },
                    },
                    {
                      district: {
                        contains: options?.include,
                        mode: "insensitive",
                      },
                    },
                    {
                      email: {
                        contains: options?.include,
                        mode: "insensitive",
                      },
                    },
                    {
                      name: { contains: options?.include, mode: "insensitive" },
                    },
                    {
                      note: { contains: options?.include, mode: "insensitive" },
                    },
                    {
                      phone: {
                        contains: options?.include,
                        mode: "insensitive",
                      },
                    },
                    {
                      policeStation: {
                        contains: options?.include,
                        mode: "insensitive",
                      },
                    },
                    {
                      urgentPhone: {
                        contains: options?.include,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {},
      options?.user_id
        ? {
            userId: {
              contains: options?.user_id,
              mode: "insensitive",
            },
          }
        : {},
      options?.phone
        ? {
            shippingAddress: {
              phone: options?.phone,
            },
          }
        : {},
      options?.subTotal
        ? {
            orderCost: {
              subTotal: {
                lte: parseInt(options?.subTotal),
              },
            },
          }
        : {},
      options?.statusText
        ? {
            status: {
              textCode: options?.statusText,
            },
          }
        : {},
    ],
  };

  const include: Prisma.OrderInclude = {
    shippingAddress: options.shippingAddress ? true : false,
    cart: options.cart
      ? {
          include: {
            products: {
              include: {
                product: true,
                inventory: true,
              },
            },
          },
        }
      : false,
    orderCost: options.orderCost ? true : false,
    payment: options.payment ? true : false,
    status: options.status ? true : false,
  };

  const orderBy = options?.sortBy
    ? { [options?.sortBy]: options?.sortType ? options?.sortType : "asc" }
    : {};

  return {
    where,
    include,
    orderBy,
  };
};
