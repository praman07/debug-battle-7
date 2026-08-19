import { IOrder } from "../models/order.model";

export abstract class OrderContract {
  abstract placeOrder(userId: string): Promise<IOrder>;
  abstract getOrderHistory(userId: string): Promise<IOrder[]>;
}
