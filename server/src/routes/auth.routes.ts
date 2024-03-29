import { Router } from "express";
import { redirectToAuthUrl } from "../controllers/auth/providers/redirect-to-auth-url";
import { providerLogin } from "../controllers/auth/provider-login.controller";
import { logout } from "../controllers/auth/logout.controller";
import { credentialLogin } from "../controllers/auth/credential-login.controller";
import { credentialRegister } from "../controllers/auth/credential-register.controller";
import { refreshToken } from "../controllers/auth/refresh-token.controller";

const router = Router();
router.route("/register").post(credentialRegister);
router.route("/login").post(credentialLogin);

router.route("/login/:provider").get(redirectToAuthUrl);
router.route("/login/:provider/callback").get(providerLogin);

router.route("/refresh-token").get(refreshToken)

router.route("/logout").get(logout)

export default router;
