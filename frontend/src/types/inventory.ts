// src/types/inventory.ts

export type LogChangeType =
  | "RESTOCK"
  | "ADJUSTMENT"
  | "STOCK_IN"
  | "ORDER_DEDUCTION"
  | string;

export interface InventoryLog {
  logId: number;
  productId: number;
  changeType: LogChangeType;
  quantityChange: number;
  reason: string;
  adminId: string;
  loggedAt: string | Date;
  product?: {
    name: string;
    unit: string;
    category?: string;
  };
}

export interface RestockPayload {
  productId: number;
  quantity: number;
  reason: string;
}

export interface AdjustPayload {
  productId: number;
  adjustment: number;
  reason: string;
}
