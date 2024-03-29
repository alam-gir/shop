import { Router } from "express";
import { isAuthenticate } from "../middlewares/only-authenticate.middleware";
import { isAdmin } from "../middlewares/only-admin.middleware";
import { productControllers } from "../controllers/product/product.controllers";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router
  .route("/")
  .get(productControllers.getAll)
  .post(isAuthenticate, isAdmin, productControllers.create);

router
  .route("/:id")
  .get(productControllers.getSignle)
  .patch(
    upload.array("images", 10),
    isAuthenticate,
    isAdmin,
    productControllers.update
  )
  .delete(isAuthenticate, isAdmin, productControllers.remove);

export default router;
