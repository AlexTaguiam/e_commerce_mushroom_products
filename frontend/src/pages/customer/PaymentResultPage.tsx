import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCartPaymentStatus,
  type CartPaymentStatus,
} from "@/services/payment.service";
import { getOrderById } from "@/services/order.service";

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 3000;

export default function PaymentResultPage() {
  const { paymentIntentId } = useParams<{ paymentIntentId: string }>();
  const [result, setResult] = useState<CartPaymentStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Define an interface for typing the caught error safely
  interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  }

  // 1. Remove the standalone 'checkStatus' useCallback block.
  // 2. Put the fetch logic directly inside useEffect with cleanup:

  useEffect(() => {
    let isSubscribed = true;

    if (!paymentIntentId) return;

    const fetchStatus = async () => {
      try {
        const response = await getCartPaymentStatus(paymentIntentId);
        if (!isSubscribed) return;

        console.log("Get payment status:", response);

        if (response.success && response.data) {
          setResult(response.data);
        } else {
          setErrorMessage(
            response.message || "Unable to verify payment status.",
          );
        }
      } catch (error: unknown) {
        if (!isSubscribed) return;
        const apiError = error as ApiError;
        setErrorMessage(
          apiError.response?.data?.message ||
            apiError.message ||
            "Unable to verify payment status.",
        );
      }
    };

    void fetchStatus();

    return () => {
      isSubscribed = false;
    };
  }, [paymentIntentId, pollCount]);

  useEffect(() => {
    if (result?.status !== "processing" || pollCount >= MAX_POLL_ATTEMPTS)
      return;
    const timer = window.setTimeout(
      () => setPollCount((count) => count + 1),
      POLL_INTERVAL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [result, pollCount]);

  if (!result && !errorMessage) {
    return <Loading attempt={pollCount} />;
  }

  if (
    errorMessage ||
    result?.status === "failed" ||
    (result?.status === "processing" && pollCount >= MAX_POLL_ATTEMPTS)
  ) {
    return (
      <div className="w-full min-h-[75vh] bg-[#faf8f4] flex items-center justify-center px-4 text-center">
        <div className="max-w-md w-full bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h1 className="font-serif font-bold text-2xl text-[#2d4029] mb-2">
            Payment Failed
          </h1>
          <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
            {errorMessage ||
              "Payment didn't go through. Your cart is still saved — you can try again."}
          </p>
          <Button
            nativeButton={false}
            className="bg-[#4c6a46] text-white rounded-xl"
            render={<Link to="/checkout">Return to checkout</Link>}
          />
        </div>
      </div>
    );
  }

  if (result?.status === "processing") return <Loading attempt={pollCount} />;

  const paidResult = result as Extract<CartPaymentStatus, { status: "paid" }>;

  return (
    <div className="w-full min-h-[75vh] bg-[#faf8f4] flex items-center justify-center px-4 text-center">
      <div className="max-w-md w-full bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h1 className="font-serif font-bold text-2xl text-[#2d4029] mb-2">
          Payment Successful!
        </h1>
        <p className="text-xs text-gray-400 font-medium mb-6">
          Your order #{paidResult.orderId} has been created.
        </p>
        <Button
          nativeButton={false}
          className="bg-[#4c6a46] text-white rounded-xl"
          render={<Link to={`/orders/${paidResult.orderId}`}>View order</Link>}
        />
      </div>
    </div>
  );
}

function Loading({ attempt }: { attempt: number }) {
  return (
    <div className="w-full min-h-[75vh] bg-[#faf8f4] flex flex-col items-center justify-center px-4 text-center">
      <Loader2 className="w-10 h-10 animate-spin text-[#4c6a46] mb-4" />
      <h1 className="font-serif font-bold text-xl text-[#2d4029] mb-1">
        Processing payment
      </h1>
      <p className="text-xs text-gray-400 font-medium">
        {attempt
          ? `Checking status (${attempt} of ${MAX_POLL_ATTEMPTS})...`
          : "Waiting for payment confirmation..."}
      </p>
    </div>
  );
}

export function LegacyPaymentResultPage() {
  const { orderId } = useParams<{ orderId: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await getOrderById(orderId);
        if (!cancelled && response.success) setOrder(response.data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [orderId]);

  if (failed)
    return <p className="p-8 text-center">Unable to verify payment status.</p>;
  if (!order || order.paymentStatus !== "paid") return <Loading attempt={0} />;
  return (
    <div className="w-full min-h-[75vh] bg-[#faf8f4] flex items-center justify-center px-4 text-center">
      <div className="max-w-md w-full bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h1 className="font-serif font-bold text-2xl text-[#2d4029] mb-6">
          Payment Successful!
        </h1>
        <Button
          nativeButton={false}
          className="bg-[#4c6a46] text-white rounded-xl"
          render={<Link to={`/orders/${order.orderId}`}>View order</Link>}
        />
      </div>
    </div>
  );
}
