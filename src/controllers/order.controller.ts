import { Request, Response, NextFunction } from "express";
import orderService from "../services/order.service";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

class OrderController {
  async placeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, "Not authorized");
      const order = await orderService.placeOrder(req.user.id);
      res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getOrderHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, "Not authorized");
      const orders = await orderService.getOrderHistory(req.user.id);
      res.status(200).json(new ApiResponse(200, orders, "Order history fetched successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
