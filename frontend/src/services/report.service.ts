import { adminApi } from "@/api/client";

export interface ReportRange {
  from: string;
  to: string;
}

export interface SalesSummary {
  from: string;
  to: string;
  orderCount: number;
  itemsSold: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface BestSellingProduct {
  productId: number;
  name: string;
  category: string | null;
  quantitySold: number;
  revenue: number;
}

export interface CustomerPurchase {
  customerId: string;
  name: string;
  email: string | null;
  orderCount: number;
  totalSpent: number;
}

export interface SalesTrend {
  date: string;
  orderCount: number;
  revenue: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const params = (range: ReportRange) => ({ params: range });

export async function getSalesSummary(range: ReportRange) {
  return adminApi.get<ApiResponse<SalesSummary>>(
    "/reports/sales-summary",
    params(range),
  );
}

export async function getBestSellingProducts(range: ReportRange) {
  return adminApi.get<ApiResponse<BestSellingProduct[]>>(
    "/reports/best-selling",
    params(range),
  );
}

export async function getCustomerPurchaseSummary(range: ReportRange) {
  return adminApi.get<ApiResponse<CustomerPurchase[]>>(
    "/reports/customers",
    params(range),
  );
}

export async function getSalesTrends(range: ReportRange) {
  return adminApi.get<ApiResponse<SalesTrend[]>>(
    "/reports/sales-trends",
    params(range),
  );
}

export async function downloadSalesXml(range: ReportRange) {
  return adminApi.get<Blob>("/reports/export/xml", {
    ...params(range),
    responseType: "blob",
  });
}
