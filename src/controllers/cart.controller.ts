import { Request, Response, NextFunction } from "express";
import cartService from "../services/cart.service";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

class CartController {
  async addItemToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, "Not authorized");
      const cart = await cartService.addItemToCart(req.user.id, req.body);
      res.status(200).json(new ApiResponse(200, cart, "Item added to cart successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new ApiError(401, "Not authorized");
      const cart = await cartService.getCart(req.user.id);
      const data = cart ?? { items: [] };
      res.status(200).json(new ApiResponse(200, data, "Cart fetched successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();
