/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { adminApi } from "@/api/client";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

// --- Types ---
interface SummaryMetric {
  value: number;
  changePercent: number;
}

interface SummaryData {
  totalRevenue: SummaryMetric;
  totalOrders: SummaryMetric;
  pendingOrders: SummaryMetric;
}

interface RevenuePoint {
  label: string;
  value: number;
}

interface RevenueOverviewData {
  range: string;
  points: RevenuePoint[];
}

interface FulfillmentBucket {
  label: string;
  count: number;
  percentage: number;
}

interface FulfillmentRatioData {
  total: number;
  buckets: FulfillmentBucket[];
}

interface OrderItem {
  orderId: number;
  customerName: string;
  date: string;
  total: number;
  status: string;
}

interface LowStockProduct {
  productId: number;
  name: string;
  stockQuantity: number;
  minThreshold?: number;
}

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [revenue, setRevenue] = useState<RevenueOverviewData | null>(null);
  const [fulfillment, setFulfillment] = useState<FulfillmentRatioData | null>(
    null,
  );
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePoint, setActivePoint] = useState<RevenuePoint | null>(null);

  // 1. A pure function that ONLY fetches data (no setState here)
  const fetchEndpoints = async () => {
    const [sumRes, revRes, fulRes, ordRes, stockRes] = await Promise.all([
      adminApi.get("/dashboard/summary"),
      adminApi.get("/dashboard/revenue-overview"),
      adminApi.get("/dashboard/fulfillment-ratio"),
      adminApi.get("/dashboard/recent-orders"),
      adminApi.get("/dashboard/low-stock"),
    ]);

    // Axios wraps response payloads in .data
    return {
      sum: sumRes.data,
      rev: revRes.data,
      ful: fulRes.data,
      ord: ordRes.data,
      stock: stockRes.data,
    };
  };

  // 2. Helper function to distribute data into state
  const applyDataToState = (res: any) => {
    if (res.sum?.success) setSummary(res.sum.data);
    else if (res.sum) setSummary(res.sum);

    if (res.rev?.success) setRevenue(res.rev.data);
    else if (res.rev) setRevenue(res.rev);

    if (res.ful?.success) setFulfillment(res.ful.data);
    else if (res.ful) setFulfillment(res.ful);

    if (res.ord?.success) setRecentOrders(res.ord.data);
    else if (res.ord) setRecentOrders(res.ord);

    if (res.stock?.success) setLowStock(res.stock.data);
    else if (res.stock) setLowStock(res.stock);
  };

  // 3. Initial load effect (.then prevents synchronous setState inside effect)
  useEffect(() => {
    fetchEndpoints()
      .then(applyDataToState)
      .catch((err) => console.error("Dashboard fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // 4. Void event handler for the Refresh button (fixes TS MouseEventHandler error)
  const handleRefresh = () => {
    setLoading(true);
    fetchEndpoints()
      .then(applyDataToState)
      .catch((err) => console.error("Dashboard refresh error:", err))
      .finally(() => setLoading(false));
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  // SVG Chart Calculation for Revenue Line
  const renderRevenueAreaChart = () => {
    if (!revenue || !revenue.points || revenue.points.length === 0) return null;

    const points = revenue.points;
    const width = 800;
    const height = 240;
    const padding = 20;

    const maxValue = Math.max(...points.map((p) => p.value), 100);
    const stepX = (width - padding * 2) / (points.length - 1);

    const coordinates = points.map((p, idx) => ({
      x: padding + idx * stepX,
      y: height - padding - (p.value / maxValue) * (height - padding * 2),
      raw: p,
    }));

    const pathD = coordinates.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x},${curr.y}`;
      const prev = coordinates[idx - 1];
      const cx = (prev.x + curr.x) / 2;
      return `${acc} C ${cx},${prev.y} ${cx},${curr.y} ${curr.x},${curr.y}`;
    }, "");

    const areaD = `${pathD} L ${coordinates[coordinates.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;

    return (
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-60 overflow-visible"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d={areaD}
            fill="url(#revenueGradient)"
            className="transition-all duration-700 ease-out"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Hoverable Points */}
          {coordinates.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={activePoint?.label === pt.raw.label ? 6 : 4}
                className="fill-blue-600 stroke-white stroke-2 transition-all duration-200 group-hover:r-6 group-hover:fill-blue-500"
                onMouseEnter={() => setActivePoint(pt.raw)}
              />
            </g>
          ))}
        </svg>

        {/* Selected Data Point Tooltip/Display */}
        <div className="flex justify-between items-center mt-2 px-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
          <span>{points[0]?.label}</span>
          {activePoint ? (
            <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full animate-fade-in">
              {activePoint.label}: {formatCurrency(activePoint.value)}
            </span>
          ) : (
            <span className="italic">Hover over dots to see details</span>
          )}
          <span>{points[points.length - 1]?.label}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-gray-500 font-medium">
          Fetching dashboard insights...
        </p>
      </div>
    );
  }

  console.log("Recent Orders:", recentOrders);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500">
            Real-time store performance & metrics
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Total Revenue
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary?.totalRevenue.value || 0)}
            </h2>
            <div
              className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                (summary?.totalRevenue.changePercent || 0) >= 0
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {(summary?.totalRevenue.changePercent || 0) >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {summary?.totalRevenue.changePercent}%
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Total Orders
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {summary?.totalOrders.value || 0}
            </h2>
            <div
              className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                (summary?.totalOrders.changePercent || 0) >= 0
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {(summary?.totalOrders.changePercent || 0) >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {summary?.totalOrders.changePercent}%
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Pending Orders
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {summary?.pendingOrders.value || 0}
            </h2>
            <div className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {summary?.pendingOrders.changePercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Revenue Overview
              </h3>
              <p className="text-xs text-gray-500">Last 30 Days Trend</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 rounded-md text-gray-600">
              30d
            </span>
          </div>
          {renderRevenueAreaChart()}
        </div>

        {/* Fulfillment Ratio Donut/Progress */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Fulfillment Ratio
            </h3>
            <p className="text-xs text-gray-500">
              Total Processed: {fulfillment?.total || 0} Orders
            </p>
          </div>

          <div className="space-y-4 my-auto">
            {fulfillment?.buckets.map((bucket, idx) => {
              const colors = [
                "bg-emerald-500", // Completed
                "bg-amber-500", // Pending
                "bg-blue-500", // Shipped
              ];
              const bgBar = colors[idx % colors.length];

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700">{bucket.label}</span>
                    <span className="text-gray-500">
                      {bucket.count} ({bucket.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bgBar} transition-all duration-1000 ease-out`}
                      style={{ width: `${bucket.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 text-center">
            Updated automatically from order status
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-gray-900">
            Recent Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="hover:bg-gray-50/50 transition"
                    >
                      <td className="py-3 font-medium text-gray-900">
                        #{order.orderId}
                      </td>
                      <td className="py-3 text-gray-600">
                        {order.customerName.trim()
                          ? order.customerName
                          : "Guest Customer"}
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(order.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            order.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900">
              Low Stock Alerts
            </h3>
            <span className="p-1 bg-amber-50 text-amber-600 rounded">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>

          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-800">
                All inventory healthy!
              </p>
              <p className="text-xs text-gray-400">
                No products are currently running below threshold.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStock.map((prod) => (
                <div
                  key={prod.productId}
                  className="py-3 flex justify-between items-center"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-800">
                      {prod.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Min Threshold: {prod.minThreshold || 5} units
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg">
                    {prod.stockQuantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
