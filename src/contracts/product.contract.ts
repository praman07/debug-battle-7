import { IProduct } from "../models/product.model";
import { ProductFilterDTO, CreateProductDTO, UpdateProductDTO } from "../types/dto.types";

export abstract class ProductContract {
  abstract getAllProducts(filters: ProductFilterDTO): Promise<IProduct[]>;
  abstract getProductById(productId: string): Promise<IProduct>;
  abstract createProduct(productData: CreateProductDTO): Promise<IProduct>;
  abstract updateProduct(productId: string, updateData: UpdateProductDTO): Promise<IProduct | null>;
  abstract deleteProduct(productId: string): Promise<{ id: string }>;
}
