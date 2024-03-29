import { Router } from "express";
import { cartControllers } from "../controllers/cart/cart.controllers";

const router = Router();

router
  .route("/")
  .get(cartControllers.getCart)
  .post(cartControllers.addItem)
  .patch(cartControllers.updateCartItem)
  .delete(cartControllers.removeItem);

router.route("/:id").delete(cartControllers.delete)


export default router;
