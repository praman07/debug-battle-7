import { ICart } from "../models/cart.model";
import { AddCartItemDTO } from "../types/dto.types";

export abstract class CartContract {
  abstract addItemToCart(userId: string, itemData: AddCartItemDTO): Promise<ICart>;
  abstract getCart(userId: string): Promise<ICart | null>;
}
