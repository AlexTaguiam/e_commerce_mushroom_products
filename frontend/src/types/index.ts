// export interface Product {
//   productId: number;
//   name: string;
//   description: string;
//   price: number;
//   stockQuantity: number;
//   imageUrl?: string;
// }

export interface InventoryLog {
  logId: number;
  productId: number;
  changeType: "RESTOCK" | "ADJUSTMENT";
  quantityChange: number;
  reason: string;
  adminId: string;
  createdAt: string;
}
