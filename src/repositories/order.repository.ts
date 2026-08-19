import Order, { IOrder, IOrderItem } from "../models/order.model";

class OrderRepository {
  async create(orderData: {
    user: string;
    items: IOrderItem[];
    totalAmount: number;
  }): Promise<IOrder> {
    return Order.create(orderData);
  }

  async findByUserId(userId: string): Promise<IOrder[]> {
    return Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price");
  }
}

export default new OrderRepository();
