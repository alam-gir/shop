import { Request, Response } from "express";
import { ApiError } from "../../lib/api-response-custom";
import { removeFromCloudinary, uploadPromise } from "../../lib/cloudinary";
import { heroSliderServices } from "../../lib/db-services/heroSlider.services";
import asyncHandler from "../../lib/async-handler";

export const heroSliderControllers = {
  addImage: asyncHandler(async (req: Request, res: Response) => {
    try {
      const image = req.file;

      if (!image) throw new ApiError(400, "Image is required!");

      const uploadedImage = await uploadPromise({
        file: image,
        folder: process.env.HERO_SLIDER_IMAGE_FOLDER as string,
        progressEventName: "hero-slider-image-progress",
      });

      if (!uploadedImage) throw new ApiError(400, "Image upload failed!");

      const sliderImages = await heroSliderServices.addImage({
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      });

      if (!sliderImages) throw new ApiError(400, "Image save to DB failed!");

      return res
        .status(201)
        .json({ message: "Image added successfully!", sliderImages });
    } catch (error) {
      throw error;
    }
  }),

  getImages: asyncHandler(async (req: Request, res: Response) => {
    try {
      const heroSlider = await heroSliderServices.getAll();
      return res.status(200).json({ heroSlider });
    } catch (error) {
      throw error;
    }
  }),

  removeImage: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const sliderImage = await heroSliderServices.getImage({
        heroSliderImageId: id,
      });

      if (!sliderImage) throw new ApiError(400, "Slider image not found!");

      // remove from cloudinary
      await removeFromCloudinary(sliderImage.public_id);

      // remove from db
      const deletedImage = await heroSliderServices.removeImage({
        imageOnHeroSliderId: id,
      });

      return res.status(200).json({
        message: "Hero Slider Image Deleted Successfully!",
        deletedImage,
      });
    } catch (error) {
      throw error;
    }
  }),
};
