import Product, { IProduct } from "../models/product.model";
import { ProductFilterDTO, CreateProductDTO, UpdateProductDTO } from "../types/dto.types";
import { FilterQuery } from "mongoose";

class ProductRepository {
  async findAll(filters: ProductFilterDTO = {}): Promise<IProduct[]> {
    const query: FilterQuery<IProduct> = {};
    if (filters.category) query.category = filters.category;
    if (filters.search) query.name = { $regex: filters.search, $options: "i" };
    return Product.find(query).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id);
  }

  async create(productData: CreateProductDTO): Promise<IProduct> {
    return Product.create(productData);
  }

  async updateById(id: string, updateData: UpdateProductDTO): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async deleteById(id: string): Promise<IProduct | null> {
    return Product.findByIdAndDelete(id);
  }

  async decrementStock(id: string, quantity: number): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, { $inc: { stock: -quantity } }, { new: true });
  }
}

export default new ProductRepository();
