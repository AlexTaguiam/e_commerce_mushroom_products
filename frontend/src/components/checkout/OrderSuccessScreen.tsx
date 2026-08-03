import { Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderSuccessScreenProps {
  orderId: number;
  totalAmount: number;
  fulfillmentType: "delivery" | "pickup";
}

export default function OrderSuccessScreen({
  orderId,
  totalAmount,
  fulfillmentType,
}: OrderSuccessScreenProps) {
  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-white border border-gray-200/60 rounded-3xl p-8 text-center shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2d4029]">
            Order Confirmed!
          </h1>
          <p className="text-xs text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
            Thank you for your purchase. Your invoice allocation pipeline has
            been created and is awaiting processing.
          </p>
        </div>

        <div className="bg-[#faf8f4] border border-gray-100 rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-400">Order ID Allocation</span>
            <span className="text-[#2d4029] font-mono">#{orderId}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-400">Fulfillment Context</span>
            <span className="text-[#2d4029] uppercase tracking-wider text-[10px] bg-gray-100 px-2 py-0.5 rounded-md">
              {fulfillmentType}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 text-xs font-bold">
            <span className="text-[#2d4029]">Total Due Payment</span>
            <span className="font-serif text-sm text-[#2d4029]">
              ₱
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl text-xs font-bold border-gray-200 text-gray-500 h-10 order-2 sm:order-1"
          >
            <Link
              to="/catalog"
              className="flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </Button>

          <Button
            asChild
            className="w-full rounded-xl text-xs font-bold bg-[#4c6a46] hover:bg-[#3d5538] text-white h-10 shadow-md order-1 sm:order-2"
          >
            <Link
              to={`/orders/${orderId}`}
              className="flex items-center justify-center gap-2"
            >
              <span>Track Order Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
