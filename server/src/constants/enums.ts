export const ROLES = ["customer", "admin"] as const;

// Flat shipping fee (PHP) applied to delivery orders. Pickup orders pay 0.
export const SHIPPING_FEE = 50;
export const PRODUCT_STATUS = ["active", "out_of_stock", "inactive"] as const;
export const PRODUCT_CATEGORY = [
  "fresh",
  "dried",
  "processed",
  "spawn",
  "kits",
] as const;

export type Role = (typeof ROLES)[number];
export type ProductStatus = (typeof PRODUCT_STATUS)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORY)[number];
