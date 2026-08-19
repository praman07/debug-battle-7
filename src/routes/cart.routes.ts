import { Router } from "express";
import cartController from "../controllers/cart.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, cartController.addItemToCart);
router.get("/", protect, cartController.getCart);

export default router;
