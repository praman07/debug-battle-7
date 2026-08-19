import { CartContract } from "../contracts/cart.contract";
import cartRepository from "../repositories/cart.repository";
import productRepository from "../repositories/product.repository";
import { ApiError } from "../utils/apiError";
import { AddCartItemDTO } from "../types/dto.types";
import { ICart } from "../models/cart.model";

class CartService extends CartContract {
  async addItemToCart(userId: string, { productId, quantity }: AddCartItemDTO): Promise<ICart> {
    if (!productId || !quantity || quantity < 1) {
      throw new ApiError(400, "productId and a valid quantity are required");
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    if (product.stock < quantity) {
      throw new ApiError(400, "Insufficient stock for this product");
    }

    let cart = await cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createForUser(userId);
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: product._id, quantity });
    }

    await cartRepository.save(cart);
    await cart.populate("items.product", "name price stock");
    return cart;
  }

  async getCart(userId: string): Promise<ICart | null> {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) return null;
    await cart.populate("items.product", "name price stock");
    return cart;
  }
}

export default new CartService();
