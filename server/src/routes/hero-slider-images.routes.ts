import { Router } from "express";
import { isAuthenticate } from "../middlewares/only-authenticate.middleware";
import { isAdmin } from "../middlewares/only-admin.middleware";
import { upload } from "../middlewares/multer.middleware";
import { heroSliderControllers } from "../controllers/hero-slider-images/heroSlider.controllers";

const router = Router();

router
  .route("/")
  .get(heroSliderControllers.getImages)
  .post(
    upload.single("image"),
    isAuthenticate,
    isAdmin,
    heroSliderControllers.addImage
  );

router
  .route("/:id")
  .delete(isAuthenticate, isAdmin, heroSliderControllers.removeImage);

export default router;
