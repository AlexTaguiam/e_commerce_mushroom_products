import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import StepTracker from "./StepTracker";

interface OrderItem {
  quantity: number;
  priceAtOrder: string;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  orderId: number;
  userId: string;
  orderDate: string;
  fulfillmentType: "pickup" | "delivery";
  deliveryAddress: string | null;
  status:
    | "confirmed"
    | "ready"
    | "out_for_delivery"
    | "completed"
    | "cancelled";
  paymentMethod: "cod" | "paymongo";
  paymentStatus: "unpaid" | "paid" | "pending";
  totalAmount: string;
  orderItems: OrderItem[];
}

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const formattedDate = new Date(order.orderDate).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const parsedTotal = parseFloat(order.totalAmount) || 0;
  const maxThumbnailDisplay = 3;
  const remainingCount = order.orderItems.length - maxThumbnailDisplay;

  // Render text mappings for status codes
  const paymentStatusStyles = {
    paid: "bg-green-50 text-green-700 border-green-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    unpaid: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <Link
      to={`/orders/${order.orderId}`}
      className="group block bg-white border border-gray-200/60 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 space-y-5"
    >
      {/* Top Meta Info Area */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-base text-[#2d4029]">
              Order #{order.orderId}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-lg ${
                order.fulfillmentType === "delivery"
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : "bg-purple-50 text-purple-700 border-purple-100"
              }`}
            >
              {order.fulfillmentType}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#4c6a46]" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Financial Aggregation Displays */}
        <div className="text-right sm:text-right">
          <span className="font-serif font-bold text-lg text-[#2d4029] block">
            ₱
            {parsedTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
          <span
            className={`inline-block text-[10px] font-bold uppercase border rounded-md px-2 py-0.5 ${paymentStatusStyles[order.paymentStatus]}`}
          >
            {order.paymentStatus} ({order.paymentMethod.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Item Summary Segment Row */}
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Compact Image Strip */}
          <div className="flex -space-x-2 overflow-hidden shrink-0">
            {order.orderItems.slice(0, maxThumbnailDisplay).map((item, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-xl bg-[#faf8f4] border border-white shadow-sm overflow-hidden aspect-square"
              >
                <img
                  src={
                    item.product?.imageUrl ||
                    "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=100"
                  }
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Descriptive Content */}
          <div className="text-xs font-medium text-[#2d4029] line-clamp-1 pr-2">
            {order.orderItems[0]?.product?.name}
            {order.orderItems.length > 1 && (
              <span className="text-gray-400 font-semibold">
                {remainingCount > 0
                  ? ` and ${remainingCount + 1} more items`
                  : " and 1 more item"}
              </span>
            )}
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-[#faf8f4] text-gray-400 group-hover:bg-[#4c6a46]/5 group-hover:text-[#4c6a46] flex items-center justify-center shrink-0 transition-all">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Embedded Dynamic Stage Pipeline */}
      <div className="bg-[#faf8f4] border border-gray-100 rounded-2xl p-4">
        <StepTracker
          fulfillmentType={order.fulfillmentType}
          status={order.status}
          variant="compact"
        />
      </div>
    </Link>
  );
}
