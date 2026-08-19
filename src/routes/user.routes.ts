import { Router } from "express";
import userController from "../controllers/user.controller";

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/refresh-token", userController.refreshToken);
router.post("/logout", userController.logout);

export default router;
