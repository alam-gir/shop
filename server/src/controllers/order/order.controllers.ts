import { Request, Response } from "express";
import asyncHandler from "../../lib/async-handler";
import { RequestWithUser } from "../../../@types/custom";
import { ApiError } from "../../lib/api-response-custom";
import { orderServices } from "../../lib/db-services/order.services";
import {
  GetOrderOptions,
  GetOrdersProps,
  ShippingAddress,
} from "../../types/types";
import { getPaginationOptions, requiredFeids } from "../../lib/utils";
import { PAYMENTMETHOD, Payment } from "@prisma/client";

import ejs from "ejs";
import { mailServices } from "../../lib/mail-Services/mail.services";
import { sendOrderEmail } from "../../lib/mail-Services/send-order-email";

type GetOrderQuery = {
  orderCost?: "true" | undefined;
  status?: "true" | undefined;
  shippingAddress?: "true" | undefined;
  cart?: "true" | undefined;
};

type ReqBody = {
  shippingAddress: ShippingAddress;
  paymentInfo: {
    method: PAYMENTMETHOD;
    transactionId: string | undefined;
  };
};

export const orderControllers = {
  place: asyncHandler(
    async (req: RequestWithUser<{}, ReqBody>, res: Response) => {
      const userId = req.user?.id || undefined;

      const cart_id = req.cookies.cart_id;

      const { shippingAddress, paymentInfo } = req.body;

      const { urgentPhone, note, ...requiredFromShippingAddress } =
        shippingAddress;

      await requiredFeids({
        ...requiredFromShippingAddress,
        method: paymentInfo.method,
      });

      const order = await orderServices.place({
        response: res,
        userId,
        cart_id,
        paymentInfo,
        shippingAddress,
      });

      res.status(201).json({ success: true, message: "Order Placed", order });

      // send email to client
      if (!order) return;
      await mailServices.orderPlaced({ shippingAddress, order, paymentInfo });
    }
  ),

  get: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (!id) throw new ApiError(400, "Order not found");

    const { cart, orderCost, shippingAddress, status } =
      req.query as GetOrderQuery;

    const order = await orderServices.get(
      id,
      getOrderQuery({ cart, orderCost, shippingAddress, status })
    );
    if (!order) throw new ApiError(404, "Order not found");

    return res.status(200).json({ success: true, order });
  }),

  getMy: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user?.id;

    const {
      include,
      phone,
      sortType,
      statusText,
      sortBy,
      subTotal,
      payment,
      cart,
      orderCost,
      shippingAddress,
      status,
      user,
    } = req.query as GetOrdersProps;

    if (!userId) throw new ApiError(400, "User not found");
    const orders = await orderServices.getMy({
      include,
      phone,
      sortType,
      statusText,
      user_id : userId,
      sortBy,
      subTotal,
      payment,
      cart,
      orderCost,
      shippingAddress,
      status,
      user,
    });

    return res.status(200).json({ success: true, orders });
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const {
      include,
      phone,
      sortType,
      statusText,
      user_id,
      page,
      limit,
      sortBy,
      subTotal,
      payment,
      cart,
      orderCost,
      shippingAddress,
      status,
      user,
    } = req.query as GetOrdersProps;

    const { skip, take } = getPaginationOptions({ page, limit });

    const orders = await orderServices.getAll({
      skip,
      take,
      include,
      phone,
      sortBy,
      sortType,
      subTotal,
      payment,
      cart,
      orderCost,
      shippingAddress,
      status,
      user,
      statusText,
      user_id,
    });

    return res
      .status(200)
      .json({ success: true, data: { ...orders, currentPage: page } });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { status } = req.query as { status: string };
    const { message } = req.body as { message: string | undefined };

    if (!id) throw new ApiError(400, "Order not found");

    let updatedOrder: any;
    switch (status) {
      case "processing":
        updatedOrder = await orderServices.updateStatus.processing({
          id,
          message,
        });
        break;

      case "shipping":
        updatedOrder = await orderServices.updateStatus.shipping({
          id,
          message,
        });
        break;

      case "shipped":
        updatedOrder = await orderServices.updateStatus.shipped({
          id,
          message,
        });
        break;

      case "hold":
        updatedOrder = await orderServices.updateStatus.hold({ id, message });
        break;

      case "unHold":
        updatedOrder = await orderServices.updateStatus.unHold({ id, message });
        break;

      case "complete":
        updatedOrder = await orderServices.updateStatus.complete({
          id,
          message,
        });
        break;

      case "return":
        updatedOrder = await orderServices.updateStatus.return({ id, message });
        break;

      case "cancel":
        updatedOrder = await orderServices.updateStatus.cancel({ id, message });
        break;

      default:
        throw new ApiError(400, "Invalid status");
    }

    if (!updatedOrder)
      throw new ApiError(400, `Failed to update order status to ${status}.`);

    res.status(200).json({
      success: true,
      message: `Order updated to ${status} successfully!`,
      updatedOrder,
    });

    // send email
    await sendOrderEmail({ status, orderId: updatedOrder.id });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const deletedOrder = await orderServices.delete(id);
    return res
      .status(200)
      .json({ success: true, message: "Order Deleted", deletedOrder });
  }),
};

const getOrderQuery = (options: GetOrderQuery) => {
  const query = {} as GetOrderOptions;
  if (options.cart === "true") query.cart = true;
  if (options.orderCost === "true") query.orderCost = true;
  if (options.shippingAddress === "true") query.shippingAddress = true;
  if (options.status === "true") query.status = true;
  return query;
};
