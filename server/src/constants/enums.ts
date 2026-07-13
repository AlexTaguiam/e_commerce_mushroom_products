export const ROLES = ["customer", "admin"] as const;
export const PRODUCT_STATUS = ["active", "out_of_stock", "inactive"] as const;
export const PRODUCT_CATEGORY = [
  "fresh",
  "dried",
  "processed",
  "spawn",
] as const;

export type Role = (typeof ROLES)[number];
export type ProductStatus = (typeof PRODUCT_STATUS)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORY)[number];
