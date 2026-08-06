import { type Order } from "@/types/order";
import { getOrderActions, getStatusBadgeConfig } from "@/utils/orderAction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Truck, Store, Ban, Loader2, Eye } from "lucide-react";

interface OrderRowProps {
  order: Order;
  onSelectOrder: (order: Order) => void;
  onAdvanceStatus: (order: Order) => void;
  onInitiateCancel: (order: Order) => void;
  actionLoadingId: number | null;
}

export function OrderRow({
  order,
  onSelectOrder,
  onAdvanceStatus,
  onInitiateCancel,
  actionLoadingId,
}: OrderRowProps) {
  const { primaryAction, canCancel } = getOrderActions(order);
  const statusBadge = getStatusBadgeConfig(order.status);
  const isLoading = actionLoadingId === order.orderId;

  const itemCount =
    order.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const firstProductName = order.orderItems?.[0]?.product?.name || "Item";
  const itemSummary =
    order.orderItems?.length > 1
      ? `${firstProductName} + ${order.orderItems.length - 1} more`
      : firstProductName;

  const formattedDate = new Date(order.orderDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <tr
      onClick={() => onSelectOrder(order)}
      className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors cursor-pointer group text-xs text-slate-300"
    >
      {/* Order ID & Date */}
      <td className="py-3.5 px-4 font-mono">
        <div className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
          #{order.orderId}
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3 text-slate-600" />
          {formattedDate}
        </div>
      </td>

      {/* Customer */}
      <td className="py-3.5 px-4">
        <div className="font-medium text-slate-200">
          {order.userName || "Customer"}
        </div>
        <div className="text-[11px] font-mono text-slate-500 truncate max-w-30">
          {order.userId}
        </div>
      </td>

      {/* Fulfillment */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        {order.fulfillmentType === "delivery" ? (
          <Badge
            variant="outline"
            className="bg-sky-500/10 text-sky-400 border-sky-500/20 font-sans text-[10px] gap-1 px-2 py-0.5"
          >
            <Truck className="w-3 h-3" />
            Delivery
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-teal-500/10 text-teal-400 border-teal-500/20 font-sans text-[10px] gap-1 px-2 py-0.5"
          >
            <Store className="w-3 h-3" />
            Pickup
          </Badge>
        )}
      </td>

      {/* Summary */}
      <td className="py-3.5 px-4 max-w-45">
        <div className="font-medium text-slate-300 truncate">{itemSummary}</div>
        <div className="text-[11px] text-slate-500">
          {itemCount} total units
        </div>
      </td>

      {/* Payment & Amount */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="font-mono font-bold text-slate-100">
          ₱{parseFloat(order.totalAmount || "0").toFixed(2)}
        </div>
        <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center gap-1 mt-0.5">
          <span className="text-slate-400 font-semibold">
            {order.paymentMethod}
          </span>
          <span>•</span>
          <span
            className={
              order.paymentStatus === "paid"
                ? "text-emerald-400"
                : "text-slate-500"
            }
          >
            {order.paymentStatus}
          </span>
        </div>
      </td>

      {/* Status Badge */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <Badge
          variant="outline"
          className={`font-mono text-[11px] px-2.5 py-0.5 ${statusBadge.className}`}
        >
          {statusBadge.label}
        </Badge>
      </td>

      {/* Contextual Action Area */}
      <td
        className="py-3.5 px-4 text-right whitespace-nowrap"
        onClick={(e) => e.stopPropagation()} // Prevent triggering detail drawer
      >
        <div className="flex items-center justify-end gap-1.5">
          {primaryAction && (
            <Button
              size="sm"
              disabled={isLoading}
              onClick={() => onAdvanceStatus(order)}
              className={`h-7 px-3 text-[11px] font-semibold transition-all shadow-sm ${
                primaryAction.variant === "primary"
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  : primaryAction.variant === "indigo"
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : primaryAction.variant === "purple"
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <primaryAction.icon className="w-3 h-3 mr-1" />
              )}
              {primaryAction.label}
            </Button>
          )}

          {canCancel && (
            <Button
              size="icon"
              variant="ghost"
              disabled={isLoading}
              onClick={() => onInitiateCancel(order)}
              title="Cancel Order"
              className="h-7 w-7 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
            >
              <Ban className="w-3.5 h-3.5" />
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSelectOrder(order)}
            title="View Details"
            className="h-7 w-7 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
