import { useState, useEffect } from "react";
import { Inbox } from "lucide-react";
import { api } from "@/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OrderCard from "@/components/OrderCard";

interface Order {
  orderId: number;
  userId: string;
  orderDate: string;
  fulfillmentType: "pickup" | "delivery";
  deliveryAddress: string | null;
  status:
    | "pending"
    | "confirmed"
    | "ready"
    | "out_for_delivery"
    | "completed"
    | "cancelled";
  paymentMethod: "cod" | "paymongo";
  paymentStatus: "unpaid" | "paid" | "pending";
  totalAmount: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderItems: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const response = await api.get("/orders");
        const resData = response.data; // The root JSON body with success, message, data

        if (resData.success && resData.data) {
          // Extract the nested orders array directly from the shape: resData.data.orders
          const ordersArray = resData.data.orders;

          setOrders(Array.isArray(ordersArray) ? ordersArray : []);
        } else {
          setError(resData.message || "Failed to populate order data vectors.");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Failed to communicate with authorization server endpoints.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  // Filter conditions mapping logic (Executed client-side)
  const filterOrdersByStatus = (tab: string) => {
    switch (tab) {
      case "pending":
        return orders.filter((o) => o.status === "pending");
      case "confirm":
        return orders.filter((o) => o.status === "confirmed");
      case "ship":
        return orders.filter(
          (o) => o.status === "ready" || o.status === "out_for_delivery",
        );
      case "completed":
        return orders.filter((o) => o.status === "completed");
      case "cancelled":
        return orders.filter((o) => o.status === "cancelled");
      default:
        return orders;
    }
  };

  if (error) {
    return (
      <div className="w-full min-h-[60vh] bg-[#faf8f4] flex flex-col items-center justify-center p-6 text-center font-sans">
        <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 max-w-md">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#faf8f4] font-sans antialiased py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Core Profile Header */}
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#2d4029] tracking-tight">
            Purchase Purchases & Tracking
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-400 max-w-xl">
            Monitor real-time status progressions, fulfillment milestones, and
            transaction invoice parameters across your harvest allocations.
          </p>
        </div>

        {/* Navigation Tabs Controller */}
        <Tabs defaultValue="all" className="w-full space-y-6">
          <TabsList className="w-full flex justify-start overflow-x-auto no-scrollbar bg-white p-1 border border-gray-200/60 rounded-xl h-auto gap-1 shadow-sm">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-[#2d4029] data-[state=active]:text-white rounded-lg text-xs font-bold px-4 py-2 uppercase tracking-wide"
            >
              All Purchases
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-[#2d4029] data-[state=active]:text-white rounded-lg text-xs font-bold px-4 py-2 uppercase tracking-wide"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="confirm"
              className="data-[state=active]:bg-[#2d4029] data-[state=active]:text-white rounded-lg text-xs font-bold px-4 py-2 uppercase tracking-wide"
            >
              To Confirm
            </TabsTrigger>
            <TabsTrigger
              value="ship"
              className="data-[state=active]:bg-[#2d4029] data-[state=active]:text-white rounded-lg text-xs font-bold px-4 py-2 uppercase tracking-wide"
            >
              To Ship
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-[#2d4029] data-[state=active]:text-white rounded-lg text-xs font-bold px-4 py-2 uppercase tracking-wide"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="data-[state=active]:bg-[#2d4029] data-[state=active]:text-white rounded-lg text-xs font-bold px-4 py-2 uppercase tracking-wide"
            >
              Cancelled
            </TabsTrigger>
          </TabsList>

          {/* Render target loops blocks */}
          {["all", "pending", "confirm", "ship", "completed", "cancelled"].map(
            (tabKey) => {
              const displayList = filterOrdersByStatus(tabKey);

              return (
                <TabsContent
                  key={tabKey}
                  value={tabKey}
                  className="mt-0 focus-visible:outline-none"
                >
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white border border-gray-100 rounded-3xl p-6 space-y-4"
                        >
                          <div className="flex justify-between">
                            <Skeleton className="h-5 w-1/4 bg-gray-200" />
                            <Skeleton className="h-5 w-1/6 bg-gray-200" />
                          </div>
                          <Skeleton className="h-12 w-full bg-gray-200 rounded-xl" />
                          <Skeleton className="h-10 w-full bg-gray-200 rounded-xl" />
                        </div>
                      ))}
                    </div>
                  ) : displayList.length === 0 ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-white border border-gray-200/60 rounded-3xl shadow-sm">
                      <div className="w-14 h-14 rounded-full bg-[#faf8f4] flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#2d4029] mb-1">
                        No orders found
                      </h3>
                      <p className="text-xs text-gray-400 font-medium max-w-xs px-4">
                        There are currently no transaction vectors allocated
                        within this structural tab definition.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayList.map((order) => (
                        <OrderCard key={order.orderId} order={order} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            },
          )}
        </Tabs>
      </div>
    </div>
  );
}
