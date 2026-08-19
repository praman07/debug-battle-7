import { ProductContract } from "../contracts/product.contract";
import productRepository from "../repositories/product.repository";
import { ApiError } from "../utils/apiError";
import { ProductFilterDTO, CreateProductDTO, UpdateProductDTO } from "../types/dto.types";
import { IProduct } from "../models/product.model";

class ProductService extends ProductContract {
  async getAllProducts(filters: ProductFilterDTO): Promise<IProduct[]> {
    return productRepository.findAll(filters);
  }

  async getProductById(productId: string): Promise<IProduct> {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    return product;
  }

  async createProduct(productData: CreateProductDTO): Promise<IProduct> {
    const { name, price, category, stock } = productData;

    if (!name || price === undefined || !category) {
      throw new ApiError(400, "Name, price and category are required");
    }
    if (price < 0 || (stock !== undefined && stock < 0)) {
      throw new ApiError(400, "Price and stock cannot be negative");
    }
    return productRepository.create(productData);
  }

  async updateProduct(productId: string, updateData: UpdateProductDTO): Promise<IProduct | null> {
    const existing = await productRepository.findById(productId);
    if (!existing) {
      throw new ApiError(404, "Product not found");
    }
    if (updateData.price !== undefined && updateData.price < 0) {
      throw new ApiError(400, "Price cannot be negative");
    }
    return productRepository.updateById(productId, updateData);
  }

  async deleteProduct(productId: string): Promise<{ id: string }> {
    const existing = await productRepository.findById(productId);
    if (!existing) {
      throw new ApiError(404, "Product not found");
    }
    await productRepository.deleteById(productId);
    return { id: productId };
  }
}

export default new ProductService();
