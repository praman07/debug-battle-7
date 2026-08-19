import { Router } from "express";
import orderController from "../controllers/order.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, orderController.placeOrder);
router.get("/", protect, orderController.getOrderHistory);

export default router;
