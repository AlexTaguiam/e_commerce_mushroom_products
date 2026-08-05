import { type InventoryLog } from "@/types/inventory";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  UserCheck,
  Package,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

interface InventoryLogTableProps {
  logs: InventoryLog[];
  loading: boolean;
}

// Helper function to safely format dates
const formatDate = (dateValue?: string | Date) => {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function InventoryLogTable({ logs, loading }: InventoryLogTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#e5dfd3] rounded-2xl p-12 text-center shadow-sm">
        <div className="w-8 h-8 border-3 border-[#4c6a46] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500 font-semibold">
          Loading audit logs...
        </p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white border border-[#e5dfd3] rounded-2xl p-12 text-center shadow-sm">
        <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <h3 className="font-serif font-bold text-stone-700 text-sm">
          No Audit Logs Found
        </h3>
        <p className="text-xs text-stone-400 font-medium mt-1">
          No inventory stock movements match your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5dfd3] rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#faf8f4] border-b border-[#e5dfd3] text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Movement Type</th>
              <th className="py-3.5 px-4 text-right">Qty Change</th>
              <th className="py-3.5 px-4">Reason / Notes</th>
              <th className="py-3.5 px-4 text-center">Admin ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5dfd3]/60 text-xs text-stone-700">
            {logs.map((log) => {
              const normalizedType = (log.changeType || "").toUpperCase();
              const isPositive = log.quantityChange > 0;
              const formattedDate = formatDate(log.loggedAt);
              console.log("createdAt: ", log.loggedAt);
              console.log("formatted date: ", formattedDate);
              return (
                <tr
                  key={log.logId}
                  className="hover:bg-[#faf8f4]/60 transition-colors"
                >
                  {/* Date */}
                  <td className="py-3.5 px-4 font-medium text-stone-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  {/* Product Name */}
                  <td className="py-3.5 px-4 font-bold text-[#2d4029] whitespace-nowrap">
                    {log.product?.name || `Product #${log.productId}`}
                  </td>

                  {/* Movement Type Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {normalizedType === "STOCK_IN" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        INITIAL STOCK
                      </span>
                    ) : normalizedType === "ORDER_DEDUCTION" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                        <ShoppingBag className="w-3 h-3 text-orange-600" />
                        ORDER DEDUCTION
                      </span>
                    ) : normalizedType === "RESTOCK" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        RESTOCK
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          isPositive
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-rose-100 text-rose-800 border-rose-200"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3 text-blue-600" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-rose-600" />
                        )}
                        ADJUSTMENT
                      </span>
                    )}
                  </td>

                  {/* Quantity Change */}
                  <td className="py-3.5 px-4 text-right font-serif font-bold whitespace-nowrap">
                    {normalizedType === "STOCK_IN" ? (
                      <span className="text-sm text-[#2d4029]">
                        {log.quantityChange}{" "}
                        <span className="text-[10px] font-sans font-normal text-stone-500">
                          {log.product?.unit ? `${log.product.unit}s` : "units"}
                        </span>
                      </span>
                    ) : (
                      <span
                        className={`text-sm ${
                          isPositive ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {isPositive
                          ? `+${log.quantityChange}`
                          : log.quantityChange}{" "}
                        <span className="text-[10px] font-sans font-normal text-stone-500">
                          {log.product?.unit ? `${log.product.unit}s` : "units"}
                        </span>
                      </span>
                    )}
                  </td>

                  {/* Reason */}
                  <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate font-medium">
                    {log.reason || "—"}
                  </td>

                  {/* Admin ID */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-[#f4efe6] text-stone-600 px-2 py-0.5 rounded-md">
                      <UserCheck className="w-3 h-3 text-stone-400" />
                      {log.adminId ? `${log.adminId.slice(0, 8)}...` : "System"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
