import { type Order } from "@/types/order";
import { getOrderActions, getStatusBadgeConfig } from "@/utils/orderAction";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  CreditCard,
  User,
  ShoppingBag,
  Loader2,
  Ban,
  Calendar,
  Store,
  Truck,
} from "lucide-react";

interface OrderDetailSheetProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStatus: (order: Order) => void;
  onInitiateCancel: (order: Order) => void;
  actionLoadingId: number | null;
}

export function OrderDetailSheet({
  order,
  isOpen,
  onClose,
  onAdvanceStatus,
  onInitiateCancel,
  actionLoadingId,
}: OrderDetailSheetProps) {
  if (!order) return null;

  const { primaryAction, canCancel } = getOrderActions(order);
  const statusBadge = getStatusBadgeConfig(order.status);
  const isLoading = actionLoadingId === order.orderId;

  const formattedDate = new Date(order.orderDate).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl bg-slate-900 border-slate-800 text-slate-100 overflow-y-auto p-6">
        <SheetHeader className="pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              Order #{order.orderId}
            </SheetTitle>
            <Badge
              variant="outline"
              className={`font-mono text-xs px-2.5 py-0.5 ${statusBadge.className}`}
            >
              {statusBadge.label}
            </Badge>
          </div>
          <SheetDescription className="text-xs text-slate-400 flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Placed on {formattedDate}
          </SheetDescription>
        </SheetHeader>

        {/* Action Bar inside Drawer */}
        {(primaryAction || canCancel) && (
          <div className="my-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Current Action
              </p>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                {primaryAction
                  ? `Next Step: ${primaryAction.label}`
                  : "Order is finalized"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isLoading}
                  onClick={() => onInitiateCancel(order)}
                  className="h-8 px-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs"
                >
                  <Ban className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
              )}
              {primaryAction && (
                <Button
                  size="sm"
                  disabled={isLoading}
                  onClick={() => onAdvanceStatus(order)}
                  className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm shadow-emerald-900/20"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : (
                    <primaryAction.icon className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Customer & Fulfillment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Customer Info
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {order.userName || "Registered Customer"}
              </p>
              <p className="text-xs font-mono text-slate-500 truncate mt-0.5">
                ID: {order.userId}
              </p>
              {order.userEmail && (
                <p className="text-xs text-slate-400 truncate">
                  {order.userEmail}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
                {order.fulfillmentType === "delivery" ? (
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Store className="w-3.5 h-3.5 text-teal-400" />
                )}
                Fulfillment Method
              </div>
              <p className="text-sm font-semibold text-slate-200 capitalize">
                {order.fulfillmentType}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {order.fulfillmentType === "delivery"
                  ? "Courier Shipping"
                  : "Store Pick-up"}
              </p>
            </div>
          </div>

          {/* Delivery Address if applicable */}
          {order.fulfillmentType === "delivery" && (
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Delivery Address
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {order.deliveryAddress || "No address provided"}
              </p>
            </div>
          )}

          {/* Items Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Order Items ({order.orderItems.length})
            </h4>
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
              {order.orderItems.map((item, idx) => {
                const price = parseFloat(item.priceAtOrder) || 0;
                const subtotal = (price * item.quantity).toFixed(2);

                return (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {item.product?.name || "Product"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          ₱{price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-200 whitespace-nowrap">
                      ₱{subtotal}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Totals */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                Payment Method
              </span>
              <span className="font-semibold text-slate-300 uppercase">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Payment Status</span>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-mono px-2 py-0 ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {order.paymentStatus}
              </Badge>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-200">
                Total Amount
              </span>
              <span className="text-base font-bold font-mono text-emerald-400">
                ₱{parseFloat(order.totalAmount || "0").toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
