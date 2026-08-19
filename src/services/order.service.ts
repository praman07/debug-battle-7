import { OrderContract } from "../contracts/order.contract";
import orderRepository from "../repositories/order.repository";
import cartRepository from "../repositories/cart.repository";
import productRepository from "../repositories/product.repository";
import { ApiError } from "../utils/apiError";
import { IOrder, IOrderItem } from "../models/order.model";

class OrderService extends OrderContract {
  async placeOrder(userId: string): Promise<IOrder> {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty, cannot place order");
    }

    const orderItems: IOrderItem[] = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await productRepository.findById(item.product.toString());
      if (!product) {
        throw new ApiError(404, `Product ${item.product.toString()} no longer exists`);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product: ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
      totalAmount += product.price * item.quantity;

      await productRepository.decrementStock(product._id.toString(), item.quantity);
    }

    const order = await orderRepository.create({
      user: userId,
      items: orderItems,
      totalAmount,
    });

    await cartRepository.clearByUserId(userId);

    return order;
  }

  async getOrderHistory(userId: string): Promise<IOrder[]> {
    return orderRepository.findByUserId(userId);
  }
}

export default new OrderService();
