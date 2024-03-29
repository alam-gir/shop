import { Router } from "express";
import { discountControllers } from "../controllers/discount/discount.controllers";
import { isAuthenticate } from "../middlewares/only-authenticate.middleware";
import { isAdmin } from "../middlewares/only-admin.middleware";

const router = Router();

router
  .route("/")
  .get(discountControllers.getAll)
  .post(isAuthenticate, isAdmin, discountControllers.create);

router
  .route("/:id")
  .get(discountControllers.get)
  .patch(isAuthenticate, isAdmin,discountControllers.update)
  .delete(isAuthenticate, isAdmin,discountControllers.remove)

export default router;
