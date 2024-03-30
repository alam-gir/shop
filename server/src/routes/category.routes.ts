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
    upload.fields([
      { name: "banner", maxCount: 1 },
      { name: "icon", maxCount: 1 },
    ]),
    isAuthenticate,
    isAdmin,
    categoryControllers.create
  );

router
  .route("/:id")
  .get(categoryControllers.getSingle)
  .post(
    upload.fields([
      { name: "banner", maxCount: 1 },
      { name: "icon", maxCount: 1 },
    ]),
    isAuthenticate,
    isAdmin,
    categoryControllers.createSub
  )
  .patch(
    upload.fields([
      { name: "banner", maxCount: 1 },
      { name: "icon", maxCount: 1 },
    ]),
    isAuthenticate,
    isAdmin,
    categoryControllers.update
  )
  .delete(isAuthenticate, isAdmin, categoryControllers.remove);

router.route("/:id/tree").get(categoryControllers.getTree);

export default router;
