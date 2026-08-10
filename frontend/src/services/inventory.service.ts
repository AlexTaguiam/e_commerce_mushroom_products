import { api } from "../api/client";
import {
  type AdjustPayload,
  type InventoryLog,
  type RestockPayload,
} from "../types/inventory";
import { type Product } from "../types/product";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface GetInventoryLogsParams {
  product_id?: string;
}

export const getInventoryLogs = async (
  params?: GetInventoryLogsParams,
): Promise<ApiResponse<InventoryLog[]>> => {
  try {
    const result = await api.get<ApiResponse<InventoryLog[]>>(
      "/inventory/logs",
      { params },
    );
    console.log("Inventory Logs Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Inventory Logs: ", error);
    throw error;
  }
};

export const restockProduct = async (
  payload: RestockPayload,
): Promise<ApiResponse<Product>> => {
  try {
    const result = await api.post<ApiResponse<Product>>(
      "/inventory/restock",
      payload,
    );
    console.log("Restock Product Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in restocking Product: ", error);
    throw error;
  }
};

export const adjustInventory = async (
  payload: AdjustPayload,
): Promise<ApiResponse<Product>> => {
  try {
    const result = await api.post<ApiResponse<Product>>(
      "/inventory/adjust",
      payload,
    );
    console.log("Adjust Inventory Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in adjusting Inventory: ", error);
    throw error;
  }
};
