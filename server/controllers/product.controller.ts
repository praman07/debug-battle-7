import { Request, Response, NextFunction } from "express";
import productService from "../services/product.service";
import { ApiResponse } from "../utils/apiResponse";

class ProductController {
  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search } = req.query as { category?: string; search?: string };
      const products = await productService.getAllProducts({ category, search });
      res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.deleteProduct(req.params.id);
      res.status(200).json(new ApiResponse(200, result, "Product deleted successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
