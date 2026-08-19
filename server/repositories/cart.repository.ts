import Cart, { ICart } from "../models/cart.model";

class CartRepository {
  async findByUserId(userId: string): Promise<ICart | null> {
    return Cart.findOne({ user: userId });
  }

  async createForUser(userId: string): Promise<ICart> {
    return Cart.create({ user: userId, items: [] });
  }

  async save(cartDocument: ICart): Promise<ICart> {
    return cartDocument.save();
  }

  async clearByUserId(userId: string): Promise<ICart | null> {
    return Cart.findOneAndUpdate({ user: userId }, { items: [] }, { new: true });
  }
}

export default new CartRepository();
