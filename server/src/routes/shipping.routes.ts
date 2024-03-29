import { Router } from "express";
import { shippingControllers } from "../controllers/shipping/shipping.controller";
import { isAuthenticate } from "../middlewares/only-authenticate.middleware";
import { isAdmin } from "../middlewares/only-admin.middleware";

const router = Router();

router
  .route("/")
  .get(shippingControllers.get)
  .post(isAuthenticate, isAdmin, shippingControllers.create)
  .put(isAuthenticate, isAdmin, shippingControllers.update)
  .delete(isAuthenticate, isAdmin, shippingControllers.delete);

export default router;
