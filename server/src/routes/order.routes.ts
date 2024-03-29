import { Router } from "express";
import { orderControllers } from "../controllers/order/order.controllers";
import { isAuthenticate } from "../middlewares/only-authenticate.middleware";
import { isAdmin } from "../middlewares/only-admin.middleware";
import { checkAuthenticate } from "../middlewares/authenticate-checker.middleware";

const router = Router();

router
  .route("/")
  .get(isAuthenticate, orderControllers.getMy)

  .post(checkAuthenticate, orderControllers.place);

router.route("/all").get(isAuthenticate, isAdmin, orderControllers.getAll);

router
  .route("/:id")
  .get(orderControllers.get)
  .patch(isAuthenticate, isAdmin, orderControllers.updateStatus)
  .delete(isAuthenticate, isAdmin, orderControllers.delete);

export default router;
