import { Router } from "express";
import { userController } from "../controllers/user/user.controllers";
import { isAuthenticate } from "../middlewares/only-authenticate.middleware";
import { isAdmin } from "../middlewares/only-admin.middleware";

const router = Router();

router.get("/me", isAuthenticate, userController.getMe);
router.get("/all", isAuthenticate, isAdmin, userController.getAll);

export default router;
