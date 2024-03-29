import { ApiError } from "../api-response-custom";
import prisma from "./../../lib/prisma";

export const paymentServices = {
  get: async (paymentId: string) => {
    try {
      if (!paymentId) throw new ApiError(400, "Payment ID is required");
      return await prisma.payment.findUnique({ where: { id: paymentId } });
    } catch (error) {
      throw error;
    }
  },
  makePaid: async (paymentId: string) => {
    try {
      if (!paymentId) throw new ApiError(400, "Payment ID is required");

      const payment = await paymentServices.get(paymentId);
      if(payment?.status === "PAID") throw new ApiError(400, "Payment is already PAID");

      return await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "PAID" },
      });
    } catch (error) {
      throw error;
    }
  },
  makeFailed: async (paymentId: string) => {
    try {
      if (!paymentId) throw new ApiError(400, "Payment ID is required");

      const payment = await paymentServices.get(paymentId);
      if(payment?.status === "FAILED") throw new ApiError(400, "Payment is already FAILED");
      
      return await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "FAILED" },
      });
    } catch (error) {
      throw error;
    }
  },
  makeRefund: async (paymentId: string) => {
    try {
      if (!paymentId) throw new ApiError(400, "Payment ID is required");

      const payment = await paymentServices.get(paymentId);
      if(payment?.status === "REFUNDED") throw new ApiError(400, "Payment is already REFUNDED");
      
      return await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "REFUNDED" },
      });
    } catch (error) {
      throw error;
    }
  },
  makeCancel: async (paymentId: string) => {
    try {
      if (!paymentId) throw new ApiError(400, "Payment ID is required");

      const payment = await paymentServices.get(paymentId);
      if(payment?.status === "CANCEL") throw new ApiError(400, "Payment is already CANCEL");
      
      return await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "CANCEL" },
      });
    } catch (error) {
      throw error;
    }
  },
};
