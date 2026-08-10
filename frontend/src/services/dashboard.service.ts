import { api } from "../api/client";
// import { type Order } from "../types/order";
// import { type Product } from "../types/product";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface SummaryMetric {
  value: number;
  changePercent: number;
}

export interface DashboardSummaryData {
  totalRevenue: SummaryMetric;
  totalOrders: SummaryMetric;
  pendingOrders: SummaryMetric;
}

export interface RevenuePoint {
  label: string;
  value: number;
}

export interface RevenueOverviewData {
  range: string;
  points: RevenuePoint[];
}

export interface FulfillmentBucket {
  label: string;
  count: number;
  percentage: number;
}

export interface FulfillmentRatioData {
  total: number;
  buckets: FulfillmentBucket[];
}

export interface DashboardRecentOrder {
  orderId: number;
  customerName: string;
  date: string;
  total: number;
  status: string;
}

export interface LowStockProduct {
  productId: number;
  name: string;
  stockQuantity: number;
  minThreshold?: number;
}

export const getDashboardSummary = async (): Promise<
  ApiResponse<DashboardSummaryData>
> => {
  try {
    const result =
      await api.get<ApiResponse<DashboardSummaryData>>("/dashboard/summary");
    console.log("Dashboard Summary Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Dashboard Summary: ", error);
    throw error;
  }
};

export const getRevenueOverview = async (
  range?: string,
): Promise<ApiResponse<RevenueOverviewData>> => {
  try {
    const result = await api.get<ApiResponse<RevenueOverviewData>>(
      "/dashboard/revenue-overview",
      { params: range ? { range } : undefined },
    );
    console.log("Revenue Overview Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Revenue Overview: ", error);
    throw error;
  }
};

export const getFulfillmentRatio = async (): Promise<
  ApiResponse<FulfillmentRatioData>
> => {
  try {
    const result = await api.get<ApiResponse<FulfillmentRatioData>>(
      "/dashboard/fulfillment-ratio",
    );
    console.log("Fulfillment Ratio Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Fulfillment Ratio: ", error);
    throw error;
  }
};

export const getRecentOrders = async (): Promise<
  ApiResponse<DashboardRecentOrder[]>
> => {
  try {
    const result = await api.get<ApiResponse<DashboardRecentOrder[]>>(
      "/dashboard/recent-orders",
    );
    console.log("Recent Orders Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Recent Orders: ", error);
    throw error;
  }
};

export const getLowStock = async (): Promise<
  ApiResponse<LowStockProduct[]>
> => {
  try {
    const result = await api.get<ApiResponse<LowStockProduct[]>>(
      "/dashboard/low-stock",
    );
    console.log("Low Stock Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Low Stock: ", error);
    throw error;
  }
};
