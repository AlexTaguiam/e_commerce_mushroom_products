export const PRODUCT_STATUS = ["active", "out_of_stock", "inactive"] as const;
export const PRODUCT_CATEGORY = [
  "fresh",
  "dried",
  "processed",
  "spawn",
  "kits",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORY)[number];

export interface Product {
  productId: number;
  name: string;
  description?: string;
  category: ProductCategory;
  price: string;
  unit: string;
  stockQuantity: number;
  status: ProductStatus;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}
