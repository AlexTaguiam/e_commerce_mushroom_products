/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  cancelOrder,
  confirmOrder,
  getOrders,
  updateOrderStatus,
} from "@/services/order.service";
import { type Order, type OrderStatus } from "@/types/order";
import { getOrderActions, getStatusBadgeConfig } from "@/utils/orderAction";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Search,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  Sparkles,
  XCircle,
  MapPin,
  CreditCard,
  User,
  Store,
  Ban,
  Eye,
  Calendar,
  Package,
} from "lucide-react";

type TabOption = "all" | OrderStatus;

// Unwraps a single-order API response from service layer.
function unwrapOrder(res: { data?: Order | null }): Order | null {
  const candidate = res?.data ?? null;
  if (candidate && typeof candidate === "object" && "orderId" in candidate) {
    return candidate as Order;
  }
  return null;
}

const TABS: { id: TabOption; label: string; icon?: React.ElementType }[] = [
  { id: "all", label: "All Orders" },
  { id: "pending", label: "Pending", icon: Clock },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "ready", label: "Ready", icon: PackageCheck },
  { id: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { id: "completed", label: "Completed", icon: Sparkles },
  { id: "cancelled", label: "Cancelled", icon: XCircle },
];

export default function OrderManagerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabOption>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Synchronize data fetching with active tab (Prevents cascading renders & race conditions)
  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      try {
        const res = await getOrders(
          activeTab === "all" ? undefined : { status: activeTab },
        );

        if (!ignore) {
          const fetchedOrders = res.data?.orders || [];
          const ordersArray = Array.isArray(fetchedOrders) ? fetchedOrders : [];
          setOrders(ordersArray);
          if (activeTab === "all") {
            setPendingCount(
              ordersArray.filter((o: Order) => o.status === "pending").length,
            );
          }
        }
      } catch (err: any) {
        if (!ignore) {
          toast.error(err?.response?.data?.message || "Error loading orders");
        }
      } finally {
        if (!ignore) setLoading(false);
      }

      // Keep pending counter updated when viewing non-all tabs
      if (activeTab !== "all") {
        try {
          const pendingRes = await getOrders({ status: "pending" });
          if (!ignore && pendingRes.data) {
            const fetchedOrders = pendingRes.data.orders || [];
            const ordersArray = Array.isArray(fetchedOrders)
              ? fetchedOrders
              : [];
            setPendingCount(ordersArray.length);
          }
        } catch {
          console.log("erro tabs");
        }
      }
    };

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  // Manual refresh trigger
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const res = await getOrders(
        activeTab === "all" ? undefined : { status: activeTab },
      );
      const fetchedOrders = res.data?.orders || [];
      const ordersArray = Array.isArray(fetchedOrders) ? fetchedOrders : [];
      setOrders(ordersArray);
      if (activeTab === "all") {
        setPendingCount(
          ordersArray.filter((o: Order) => o.status === "pending").length,
        );
      }
      toast.success("Orders refreshed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to refresh orders");
    } finally {
      setLoading(false);
    }
  };

  // Status transition handler using adminApi
  const handleAdvanceStatus = async (order: Order) => {
    const { primaryAction } = getOrderActions(order);
    if (!primaryAction) return;

    setActionLoadingId(order.orderId);

    try {
      let updatedOrder: Order | null;
      if (primaryAction.endpointType === "confirm") {
        await confirmOrder(order.orderId);
        updatedOrder = { ...order, status: "confirmed" as OrderStatus };
      } else {
        const res = await updateOrderStatus(
          order.orderId,
          primaryAction.nextStatus!,
        );
        updatedOrder = unwrapOrder(res);
      }

      if (!updatedOrder) {
        throw new Error("Unexpected response shape from status update");
      }

      toast.success(
        `Order #${order.orderId} moved to ${updatedOrder.status.replace("_", " ")}`,
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === updatedOrder.orderId ? { ...o, ...updatedOrder } : o,
        ),
      );

      if (selectedOrder?.orderId === updatedOrder.orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, ...updatedOrder } : prev,
        );
      }

      if (order.status === "pending") {
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not update order status",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cancel order handler using adminApi
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    const targetOrder = orderToCancel;
    setActionLoadingId(targetOrder.orderId);

    try {
      const res = await cancelOrder(targetOrder.orderId);
      const updatedOrder = unwrapOrder(res);
      if (!updatedOrder) {
        throw new Error("Unexpected response shape from cancel");
      }

      toast.success(`Order #${targetOrder.orderId} cancelled`);

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === updatedOrder.orderId ? { ...o, ...updatedOrder } : o,
        ),
      );

      if (selectedOrder?.orderId === updatedOrder.orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, ...updatedOrder } : prev,
        );
      }

      if (targetOrder.status === "pending") {
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not cancel order");
    } finally {
      setActionLoadingId(null);
      setOrderToCancel(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesId = o.orderId.toString().includes(q);
    const matchesUser = (o.userName || o.userId || "")
      .toLowerCase()
      .includes(q);
    const matchesItem = o.orderItems?.some((i) =>
      (i.product?.name || "").toLowerCase().includes(q),
    );
    return matchesId || matchesUser || matchesItem;
  });

  return (
    <div className="min-h-screen bg-[#faf8f4] p-6 text-stone-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e5dfd3]">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#2d4029] flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-[#4c6a46]" />
              Order Manager
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Track customer purchases, process status pipelines, and review
              order history.
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleManualRefresh}
            disabled={loading}
            className="bg-white border border-[#e5dfd3] text-[#2d4029] hover:bg-[#f4efe6] text-xs font-semibold gap-2 shadow-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#4c6a46] ${loading ? "animate-spin" : ""}`}
            />
            Refresh Orders
          </Button>
        </div>

        {/* Status Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#e5dfd3]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const isPendingTab = tab.id === "pending";

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-[#2d4029] text-white shadow-sm"
                    : "bg-white text-stone-600 border border-[#e5dfd3] hover:bg-[#f4efe6]"
                } ${
                  isPendingTab && pendingCount > 0 && !isActive
                    ? "border-amber-400 bg-amber-50/60 text-amber-900"
                    : ""
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5 opacity-80" />}
                {tab.label}

                {isPendingTab && pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-amber-500 text-white animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Counter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <Input
              type="text"
              placeholder="Search by Order ID, customer, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[#e5dfd3] text-stone-800 text-xs placeholder:text-stone-400 focus:border-[#4c6a46] focus:ring-[#4c6a46]/20 rounded-xl"
            />
          </div>
          <div className="text-xs text-stone-500 font-semibold">
            Showing{" "}
            <span className="text-[#2d4029] font-bold">
              {filteredOrders.length}
            </span>{" "}
            orders
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white border border-[#e5dfd3] rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#4c6a46] animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-semibold">
                Loading orders data...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif font-bold text-stone-700 text-sm">
                No Orders Found
              </h3>
              <p className="text-xs text-stone-400 font-medium max-w-sm mx-auto">
                {searchQuery
                  ? "No orders match your search criteria."
                  : `There are currently no orders under "${activeTab.replace("_", " ")}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#faf8f4] border-b border-[#e5dfd3] text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order & Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Fulfillment</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5dfd3]/60 text-xs text-stone-700">
                  {filteredOrders.map((order) => {
                    const { primaryAction, canCancel } = getOrderActions(order);
                    const statusBadge = getStatusBadgeConfig(order.status);
                    const isRowLoading = actionLoadingId === order.orderId;

                    const itemCount =
                      order.orderItems?.reduce(
                        (acc, item) => acc + item.quantity,
                        0,
                      ) || 0;
                    const firstProductName =
                      order.orderItems?.[0]?.product?.name || "Item";
                    const itemSummary =
                      order.orderItems?.length > 1
                        ? `${firstProductName} +${order.orderItems.length - 1} more`
                        : firstProductName;

                    const formattedDate = new Date(
                      order.orderDate,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={order.orderId}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-[#faf8f4]/80 transition-colors cursor-pointer group"
                      >
                        {/* Order ID & Date */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-[#2d4029] group-hover:text-[#4c6a46] transition-colors">
                            #{order.orderId}
                          </div>
                          <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5 font-sans">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {formattedDate}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-stone-800">
                            {order.userName || "Customer"}
                          </div>
                          <div className="text-[11px] font-mono text-stone-400 truncate max-w-30">
                            {order.userId}
                          </div>
                        </td>

                        {/* Fulfillment */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {order.fulfillmentType === "delivery" ? (
                            <Badge className="bg-sky-50 text-sky-800 border-sky-200 font-medium text-[10px] gap-1 px-2 py-0.5">
                              <Truck className="w-3 h-3 text-sky-600" />
                              Delivery
                            </Badge>
                          ) : (
                            <Badge className="bg-teal-50 text-teal-800 border-teal-200 font-medium text-[10px] gap-1 px-2 py-0.5">
                              <Store className="w-3 h-3 text-teal-600" />
                              Pickup
                            </Badge>
                          )}
                        </td>

                        {/* Summary */}
                        <td className="py-3.5 px-4 max-w-45">
                          <div className="font-semibold text-stone-800 truncate">
                            {itemSummary}
                          </div>
                          <div className="text-[11px] text-stone-400 font-medium">
                            {itemCount} units total
                          </div>
                        </td>

                        {/* Payment & Amount */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-serif font-bold text-sm text-[#2d4029]">
                            ₱{parseFloat(order.totalAmount || "0").toFixed(2)}
                          </div>
                          <div className="text-[10px] uppercase font-mono text-stone-500 flex items-center gap-1 mt-0.5">
                            <span className="font-bold text-stone-600">
                              {order.paymentMethod}
                            </span>
                            <span>•</span>
                            <span
                              className={
                                order.paymentStatus === "paid"
                                  ? "text-emerald-700 font-bold"
                                  : "text-stone-400"
                              }
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge
                            className={`font-mono text-[10px] font-bold px-2.5 py-1 ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-4 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {primaryAction && (
                              <Button
                                size="sm"
                                disabled={isRowLoading}
                                onClick={() => handleAdvanceStatus(order)}
                                className={`h-7 px-3 text-[11px] font-bold transition-all shadow-sm ${
                                  primaryAction.variant === "primary"
                                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                                    : "bg-[#4c6a46] hover:bg-[#3b5336] text-white"
                                }`}
                              >
                                {isRowLoading ? (
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
                                disabled={isRowLoading}
                                onClick={() => setOrderToCancel(order)}
                                title="Cancel Order"
                                className="h-7 w-7 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setSelectedOrder(order)}
                              title="View Details"
                              className="h-7 w-7 text-stone-400 hover:text-[#2d4029] hover:bg-[#f4efe6] rounded-lg"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Sheet */}
      <Sheet
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        {selectedOrder && (
          <SheetContent className="w-full sm:max-w-xl bg-white border-l border-[#e5dfd3] text-stone-800 overflow-y-auto p-6">
            <SheetHeader className="pb-4 border-b border-[#e5dfd3]">
              <div className="flex items-center justify-between gap-2">
                <SheetTitle className="text-xl font-serif font-bold text-[#2d4029] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#4c6a46]" />
                  Order #{selectedOrder.orderId}
                </SheetTitle>
                <Badge
                  className={`font-mono text-xs px-2.5 py-0.5 ${getStatusBadgeConfig(selectedOrder.status).className}`}
                >
                  {getStatusBadgeConfig(selectedOrder.status).label}
                </Badge>
              </div>
              <SheetDescription className="text-xs text-stone-500 flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Placed on {new Date(selectedOrder.orderDate).toLocaleString()}
              </SheetDescription>
            </SheetHeader>

            {/* Action Header in Sheet */}
            {(() => {
              const { primaryAction, canCancel } =
                getOrderActions(selectedOrder);
              if (!primaryAction && !canCancel) return null;

              return (
                <div className="my-5 p-4 rounded-xl bg-[#faf8f4] border border-[#e5dfd3] flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#2d4029]">
                      Order Workflow Action
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {primaryAction
                        ? `Next: ${primaryAction.label}`
                        : "Final State"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setOrderToCancel(selectedOrder)}
                        className="h-8 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs"
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" />
                        Cancel
                      </Button>
                    )}
                    {primaryAction && (
                      <Button
                        size="sm"
                        onClick={() => handleAdvanceStatus(selectedOrder)}
                        className="h-8 bg-[#4c6a46] hover:bg-[#3b5336] text-white text-xs font-bold"
                      >
                        <primaryAction.icon className="w-3.5 h-3.5 mr-1.5" />
                        {primaryAction.label}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Order Info Cards */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#e5dfd3]">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1 font-semibold">
                    <User className="w-3.5 h-3.5 text-[#4c6a46]" />
                    Customer Details
                  </div>
                  <p className="text-sm font-bold text-stone-800">
                    {selectedOrder.userName || "Registered User"}
                  </p>
                  <p className="text-xs font-mono text-stone-400 truncate mt-0.5">
                    ID: {selectedOrder.userId}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#e5dfd3]">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1 font-semibold">
                    {selectedOrder.fulfillmentType === "delivery" ? (
                      <Truck className="w-3.5 h-3.5 text-sky-600" />
                    ) : (
                      <Store className="w-3.5 h-3.5 text-teal-600" />
                    )}
                    Fulfillment Method
                  </div>
                  <p className="text-sm font-bold text-stone-800 capitalize">
                    {selectedOrder.fulfillmentType}
                  </p>
                </div>
              </div>

              {selectedOrder.fulfillmentType === "delivery" && (
                <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#e5dfd3]">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Delivery Address
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">
                    {selectedOrder.deliveryAddress || "No address provided"}
                  </p>
                </div>
              )}

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Purchased Items ({selectedOrder.orderItems?.length})
                </h4>
                <div className="divide-y divide-[#e5dfd3] border border-[#e5dfd3] rounded-xl overflow-hidden bg-white">
                  {selectedOrder.orderItems?.map((item, idx) => {
                    const price = parseFloat(item.priceAtOrder) || 0;
                    return (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#faf8f4] border border-[#e5dfd3] overflow-hidden flex items-center justify-center">
                            {item.product?.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-800">
                              {item.product?.name || "Product"}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              ₱{price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs font-serif font-bold text-[#2d4029]">
                          ₱{(price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="p-4 rounded-xl bg-[#f4efe6] border border-[#e5dfd3] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-600 flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-stone-500" />
                    Payment Method
                  </span>
                  <span className="font-bold text-stone-800 uppercase">
                    {selectedOrder.paymentMethod}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#e5dfd3] flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-700">
                    Total Amount
                  </span>
                  <span className="text-lg font-serif font-bold text-[#2d4029]">
                    ₱{parseFloat(selectedOrder.totalAmount || "0").toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>

      {/* Cancellation Alert */}
      <AlertDialog
        open={!!orderToCancel}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
      >
        <AlertDialogContent className="bg-white border-[#e5dfd3] text-stone-800 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600 flex items-center gap-2 font-serif font-bold">
              <XCircle className="w-5 h-5" />
              Cancel Order #{orderToCancel?.orderId}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-stone-600 text-xs">
              Are you sure you want to cancel this order? This action cannot be
              undone and will revert any reserved stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-stone-100 text-stone-700 border-stone-200 text-xs font-semibold">
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
