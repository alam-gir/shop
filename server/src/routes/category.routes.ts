import { Router } from "express";
import { categoryControllers } from "../controllers/category/category.controllers";
import { isAuthenticate } from "../middlewares/only-authenticate.middleware";
import { isAdmin } from "../middlewares/only-admin.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router
  .route("/")
  .get(categoryControllers.getFullTree)
  .post(
    upload.single("banner"),
    isAuthenticate,
    isAdmin,
    categoryControllers.create
  );

router
  .route("/:id")
  .get(categoryControllers.getSingle)
  .post(
    upload.single("banner"),
    isAuthenticate,
    isAdmin,
    categoryControllers.createSub
  )
  .patch(upload.single("banner"),isAuthenticate, isAdmin, categoryControllers.update)
  .delete(isAuthenticate, isAdmin, categoryControllers.remove);

router.route("/:id/tree").get(categoryControllers.getTree);

export default router;
