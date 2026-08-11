import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Receipt,
  ShieldAlert,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { cancelOrder, getOrderById } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StepTracker from "@/components/StepTracker";
import { type Order as OrderDetail } from "@/types/order";

// interface OrderItem {
//   quantity: number;
//   priceAtOrder: string;
//   product: {
//     name: string;
//     imageUrl: string;
//   };
// }

// interface OrderDetail {
//   orderId: number;
//   userId: string;
//   orderDate: string;
//   fulfillmentType: "pickup" | "delivery";
//   deliveryAddress: string | null;
//   status:
//     | "pending"
//     | "confirmed"
//     | "ready"
//     | "out_for_delivery"
//     | "completed"
//     | "cancelled";
//   paymentMethod: "cod" | "paymongo";
//   paymentStatus: "unpaid" | "paid" | "pending";
//   totalAmount: string;
//   orderItems: OrderItem[];
// }

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetailedInvoice = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        const resData = await getOrderById(orderId);
        if (resData.success && resData.data) {
          setOrder(resData.data);
        } else {
          setError(
            resData.message || "The specific order details are inaccessible.",
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Failed to populate order metadata profiles.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedInvoice();
  }, [orderId]);

  // Cancellation Handler Logic
  const handleCancelOrder = async () => {
    if (!order) return;

    // Safety check: ensure order is still in the unfulfilled initial state
    if (order.status !== "pending") {
      toast.error(
        "This order cannot be cancelled because processing has already begun.",
      );
      return;
    }

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone.",
    );
    if (!confirmCancel) return;

    try {
      setIsCancelling(true);

      const response = await cancelOrder(order.orderId);

      if (response.success) {
        toast.success("Your order has been cancelled successfully.");

        // Instantly switch local state status to 'cancelled' so UI dynamically reflects it
        setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      } else {
        toast.error(response.message || "Failed to cancel the order.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while attempting to cancel the order.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="w-full min-h-[70vh] bg-[#faf8f4] flex flex-col items-center justify-center px-4 py-12 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-5 border border-red-100">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#2d4029] mb-2">
          Invoice Profile Inaccessible
        </h2>
        <p className="text-sm text-gray-400 max-w-sm mb-8 font-medium leading-relaxed">
          {error ||
            "The individual parameter string requested could not be unpacked successfully."}
        </p>
        <Button
          nativeButton={false}
          className="bg-[#4c6a46] hover:bg-[#3d5538] text-white rounded-xl shadow-md font-semibold px-6"
          render={<Link to="/orders">Return to Trackers</Link>}
        />
      </div>
    );
  }

  const formattedDate = new Date(order.orderDate).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const parsedTotal = parseFloat(order.totalAmount) || 0;

  return (
    <div className="w-full min-h-screen bg-[#faf8f4] font-sans antialiased py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Backlink */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/orders")}
            className="text-[#4c6a46] hover:text-[#3d5538] hover:bg-[#4c6a46]/5 rounded-xl font-semibold gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard List</span>
          </Button>
        </div>

        {/* TOP STATUS HIGHLIGHT MODULE GRID */}
        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2d4029]">
                Invoice Record #{order.orderId}
              </h1>
              <span className="text-xs text-gray-400 font-medium block mt-0.5">
                Logged execution time: {formattedDate}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Conditional Cancel Button (Only shows if status is strictly 'confirmed') */}
              {order.status === "pending" && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isCancelling}
                  onClick={handleCancelOrder}
                  className="rounded-xl text-xs font-bold uppercase tracking-wider px-4 h-9 shadow-sm bg-red-600 hover:bg-red-700 text-white transition-all"
                >
                  {isCancelling ? "Cancelling..." : "Cancel Order"}
                </Button>
              )}

              <span
                className={`text-xs font-bold uppercase tracking-wider border rounded-xl px-3 py-1 ${
                  order.fulfillmentType === "delivery"
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : "bg-purple-50 text-purple-700 border-purple-100"
                }`}
              >
                Fulfillment Method: {order.fulfillmentType}
              </span>
            </div>
          </div>

          {/* Expanded Step Pipeline Engine Container */}
          <div className="py-2">
            <StepTracker
              fulfillmentType={order.fulfillmentType}
              status={order.status}
              variant="expanded"
            />
          </div>
        </div>

        {/* INTERFACE ROW LAYOUT BLOCK DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* LEFT SUBPANEL: ITEM LINE MATRIX RECORDS */}
          <div className="md:col-span-7 bg-white border border-gray-200/60 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#2d4029] flex items-center gap-2 border-b border-gray-50 pb-2">
              <Receipt className="w-4 h-4 text-[#4c6a46]" />
              <span>Manifest Line Allocations</span>
            </h3>

            <div className="divide-y divide-gray-100">
              {order.orderItems.map((item, index) => {
                const itemPrice = parseFloat(item.priceAtOrder) || 0;
                const subtotal = item.quantity * itemPrice;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 py-3.5 first:pt-1 last:pb-1"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-[#faf8f4] border border-gray-100 overflow-hidden shrink-0">
                        <img
                          src={
                            item.product?.imageUrl ||
                            "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=150"
                          }
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-[#2d4029] truncate leading-snug">
                          {item.product?.name}
                        </h4>
                        <span className="text-xs text-gray-400 font-medium block">
                          ₱{itemPrice.toLocaleString()} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-sm text-[#2d4029] shrink-0">
                      ₱
                      {subtotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SUBPANEL: CLEARANCE SUMMARIES AND DESTINATIONS */}
          <div className="md:col-span-5 space-y-6">
            {/* Conditional Delivery Address Card */}
            {order.fulfillmentType === "delivery" && (
              <div className="bg-white border border-gray-200/60 rounded-3xl p-5 shadow-sm space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#2d4029] flex items-center gap-2 border-b border-gray-50 pb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#4c6a46]" />
                  <span>Shipping Destination</span>
                </h3>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  {order.deliveryAddress ||
                    "No delivery address parameter mapped."}
                </p>
              </div>
            )}

            {/* Financial Reconciliation Audit Block */}
            <div className="bg-white border border-gray-200/60 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#2d4029] flex items-center gap-2 border-b border-gray-50 pb-2">
                <CreditCard className="w-3.5 h-3.5 text-[#4c6a46]" />
                <span>Financial Summary</span>
              </h3>

              <div className="space-y-2 text-xs font-medium text-gray-400">
                <div className="flex justify-between">
                  <span>Method Allocation</span>
                  <span className="text-[#2d4029] font-bold uppercase">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2.5">
                  <span>Clearance Status</span>
                  <span className="text-[#2d4029] font-bold uppercase">
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1 text-sm">
                  <span className="font-bold text-[#2d4029]">
                    Total Charged
                  </span>
                  <span className="font-serif font-bold text-xl text-[#2d4029]">
                    ₱
                    {parsedTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#faf8f4] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-9 w-32 bg-gray-200 rounded-xl" />
        <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6">
          <Skeleton className="h-10 w-1/3 bg-gray-200" />
          <Skeleton className="h-16 w-full bg-gray-200 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 space-y-4">
            <Skeleton className="h-4 w-1/4 bg-gray-200" />
            <Skeleton className="h-12 w-full bg-gray-200 rounded-xl" />
            <Skeleton className="h-12 w-full bg-gray-200 rounded-xl" />
          </div>
          <div className="md:col-span-5 space-y-6">
            <Skeleton className="h-24 w-full bg-gray-200 rounded-3xl" />
            <Skeleton className="h-32 w-full bg-gray-200 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
