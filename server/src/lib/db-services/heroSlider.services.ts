import prisma from "../prisma";
import { ApiError } from "../api-response-custom";

export const heroSliderServices = {
  getAll: async () => {
    try {
      return await prisma.heroSliderImages.findMany({
        include: { images: true },
      });
    } catch (error) {
      throw error;
    }
  },

  addImage: async ({ url, public_id }: { url: string; public_id: string }) => {
    try {
      if (!url || !public_id)
        throw new Error("Image url and public_id is required!");

      let sliderImages = await prisma.heroSliderImages.findFirst();

      if (!sliderImages) {
        sliderImages = await prisma.heroSliderImages.create({
          data: {
            images: {
              create: [
                {
                  public_id,
                  url,
                },
              ],
            },
          },
          include: { images: true },
        });
      } else {
        sliderImages = await prisma.heroSliderImages.update({
          where: { id: sliderImages.id },
          data: {
            images: {
              create: [
                {
                  public_id,
                  url,
                },
              ],
            },
          },
          include: { images: true },
        });
      }

      return sliderImages;
    } catch (error) {
      throw error;
    }
  },

  getImage: async ({ heroSliderImageId }: { heroSliderImageId: string }) => {
    try {
      if (!heroSliderImageId) throw new ApiError(400, "Image id is required!");

      return await prisma.imageOnHeroSlider.findUnique({
        where: { id: heroSliderImageId },
      });
    } catch (error) {
      throw error;
    }
  },

  removeImage: async ({
    imageOnHeroSliderId,
  }: {
    imageOnHeroSliderId: string;
  }) => {
    try {
      if (!imageOnHeroSliderId)
        throw new ApiError(400, "Image id is required!");

      return await prisma.imageOnHeroSlider.delete({
        where: { id: imageOnHeroSliderId },
      });
    } catch (error) {
      throw error;
    }
  },
};
