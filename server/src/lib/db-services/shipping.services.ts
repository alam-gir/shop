import prisma from "../../lib/prisma";

export const shippingServices = {
  create: async (charge: number) => {
    try {
      return await prisma.shipping.create({ data: { charge } });
    } catch (error) {
      throw error;
    }
  },
  get: async () => {
    try {
      return await prisma.shipping.findUnique({
        where: { id: "42860e63-890e-4437-bd45-f606d2edceca" },
      });
    } catch (error) {
      throw error;
    }
  },

  update: async (charge: number) => {
    try {
      const shipping = await prisma.shipping.update({
        where: { id: "42860e63-890e-4437-bd45-f606d2edceca" },
        data: { charge },
      });
      return shipping;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      return await prisma.shipping.delete({ where: { id } });
    } catch (error) {
      throw error;
    }
  },
};
