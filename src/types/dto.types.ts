

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResultDTO {
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshResultDTO {
  accessToken: string;
  refreshToken: string;
}

export interface ProductFilterDTO {
  category?: string;
  search?: string;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  category: string;
  stock?: number;
  imageUrl?: string;
}

export type UpdateProductDTO = Partial<CreateProductDTO>;

export interface AddCartItemDTO {
  productId: string;
  quantity: number;
}
