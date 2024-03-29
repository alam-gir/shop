import { Router } from "express";
import { isAuthenticate } from "../middlewares/only-authenticate.middleware";
import { isAdmin } from "../middlewares/only-admin.middleware";
import { couponControllers } from "../controllers/coupon/coupon.controllers";

const router = Router();

router
  .route("/")
  .get(couponControllers.getAll)
  .post(isAuthenticate, isAdmin, couponControllers.create);

router
  .route("/:id")
  .get(couponControllers.get)
  .patch(isAuthenticate, isAdmin, couponControllers.update)
  .delete(isAuthenticate, isAdmin, couponControllers.remove);

export default router;
