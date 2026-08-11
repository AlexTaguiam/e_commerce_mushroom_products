import type { AxiosRequestConfig } from "axios";
import { api } from "../api/client";
import { type Product, type ProductStatus } from "../types/product";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface GetProductsParams {
  category?: string;
  status?: string;
}

export const getProducts = async (
  params?: GetProductsParams,
): Promise<ApiResponse<Product[]>> => {
  try {
    const result = await api.get<ApiResponse<Product[]>>("/products", {
      params,
    });
    console.log("Products Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Products: ", error);
    throw error;
  }
};

export const getFeaturedProducts = async (
  config?: AxiosRequestConfig,
): Promise<ApiResponse<Product[]>> => {
  try {
    const result = await api.get<ApiResponse<Product[]>>(
      "/products/featured",
      config,
    );
    console.log("Featured Products Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Featured Products: ", error);
    throw error;
  }
};

export const getProductById = async (
  productId: string | number,
): Promise<ApiResponse<Product>> => {
  try {
    const result = await api.get<ApiResponse<Product>>(
      `/products/${productId}`,
    );
    console.log("Product By Id Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Product By Id: ", error);
    throw error;
  }
};

export const createProduct = async (
  formData: FormData,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<Product>> => {
  try {
    const result = await api.post<ApiResponse<Product>>(
      "/products",
      formData,
      config,
    );
    console.log("Create Product Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in creating Product: ", error);
    throw error;
  }
};

export const updateProduct = async (
  productId: number,
  formData: FormData,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<Product>> => {
  try {
    const result = await api.patch<ApiResponse<Product>>(
      `/products/${productId}`,
      formData,
      config,
    );
    console.log("Update Product Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in updating Product: ", error);
    throw error;
  }
};

export const updateProductStatus = async (
  productId: number,
  status: ProductStatus,
): Promise<ApiResponse<Product>> => {
  try {
    const result = await api.patch<ApiResponse<Product>>(
      `/products/${productId}/status`,
      { status },
    );
    console.log("Update Product Status Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in updating Product Status: ", error);
    throw error;
  }
};
