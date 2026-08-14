/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  ShieldAlert,
  Loader2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { getOrderById } from "@/services/order.service";
import { Button } from "@/components/ui/button";

const MAX_POLL_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 3000;

function isPendingPayment(status: string | undefined) {
  return status === "unpaid" || status === "pending";
}

export default function PaymentResultPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState<number>(0);

  const fetchOrderInvoiceState = useCallback(
    async (isManualRefresh = false) => {
      if (!orderId) return;

      try {
        const resData = await getOrderById(orderId);
        if (resData.success && resData.data) {
          const orderData = resData.data;
          setOrder(orderData);

          const pending = isPendingPayment(orderData.paymentStatus);
          if (!pending || isManualRefresh) {
            setLoading(false);
          }
        } else {
          setErrorMessage(
            resData.message || "Invoice record details match fault errors.",
          );
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Redirection verification runtime fault:", err);
        setErrorMessage(
          err.response?.data?.message ||
            "Failed to fetch invoice validation states.",
        );
        setLoading(false);
      }
    },
    [orderId],
  );

  // Fetch on mount and on each scheduled poll tick (setState runs after await, not synchronously in the effect).
  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    void (async () => {
      try {
        const resData = await getOrderById(orderId);
        if (cancelled) return;

        if (resData.success && resData.data) {
          const orderData = resData.data;
          setOrder(orderData);

          const pending = isPendingPayment(orderData.paymentStatus);
          if (!pending) {
            setLoading(false);
          }
        } else {
          setErrorMessage(
            resData.message || "Invoice record details match fault errors.",
          );
          setLoading(false);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error("Redirection verification runtime fault:", err);
        setErrorMessage(
          err.response?.data?.message ||
            "Failed to fetch invoice validation states.",
        );
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, pollCount]);

  // Schedule the next poll tick via timeout callback (allowed — external timer, not synchronous effect body).
  useEffect(() => {
    if (!order) return;

    const pending = isPendingPayment(order.paymentStatus);
    if (!pending || pollCount >= MAX_POLL_ATTEMPTS) return;

    const timer = window.setTimeout(() => {
      setPollCount((prev) => prev + 1);
    }, POLL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [order, pollCount]);

  const pending = order ? isPendingPayment(order.paymentStatus) : false;
  const pollingExhausted = pending && pollCount >= MAX_POLL_ATTEMPTS;
  const showLoadingScreen = loading && !errorMessage && !pollingExhausted;

  if (showLoadingScreen) {
    return (
      <div className="w-full min-h-[75vh] bg-[#faf8f4] flex flex-col items-center justify-center px-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4c6a46] mb-4" />
        <h2 className="font-serif font-bold text-xl text-[#2d4029] mb-1">
          Verifying Transaction Profiles
        </h2>
        <p className="text-xs text-gray-400 font-medium max-w-xs leading-relaxed">
          {pollCount > 0
            ? `Syncing authorization logs (Attempt ${pollCount} of ${MAX_POLL_ATTEMPTS})...`
            : "Retrieving secure verification signatures..."}
        </p>
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="w-full min-h-[75vh] bg-[#faf8f4] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-5 border border-red-100">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#2d4029] mb-2">
          Verification Failure
        </h2>
        <p className="text-xs text-gray-400 max-w-sm mb-6 font-medium leading-relaxed">
          {errorMessage}
        </p>
        <Button
          nativeButton={false}
          className="bg-[#4c6a46] hover:bg-[#3d5538] text-white rounded-xl shadow-md font-semibold px-6"
          render={<Link to="/orders">Return to Trackers</Link>}
        />
      </div>
    );
  }

  const isPaid = order.paymentStatus === "paid";
  const isFailed = order.paymentStatus === "failed";

  if (isFailed) {
    return (
      <div className="w-full min-h-[75vh] bg-[#faf8f4] flex items-center justify-center px-4 text-center">
        <div className="max-w-md w-full bg-white border border-gray-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5 border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#2d4029] mb-2">
            Payment Failed
          </h2>
          <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
            Your payment for Order #{order.orderId} did not go through. You can
            retry from your Orders page.
          </p>
          <Button
            nativeButton={false}
            className="bg-[#4c6a46] hover:bg-[#3d5538] text-white rounded-xl shadow-md font-semibold px-6"
            render={<Link to="/orders">Go to your orders</Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[75vh] bg-[#faf8f4] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white border border-gray-200/60 rounded-3xl p-6 sm:p-8 text-center shadow-sm space-y-6">
        {isPaid ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2d4029]">
                Payment Successful!
              </h1>
              <p className="text-xs text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                Your payment configuration cleared securely.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 animate-pulse">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-serif font-bold text-2xl text-[#2d4029]">
                Processing Balance Approvals
              </h1>
              <p className="text-xs text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                We are processing the transaction signatures. The dashboard
                matrix values will adjust shortly.
              </p>
            </div>
          </>
        )}

        <div className="bg-[#faf8f4] border border-gray-100 rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-400">Order ID Target</span>
            <span className="text-[#2d4029] font-mono">#{order.orderId}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-400">Clearance Profiling</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-md ${
                isPaid
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-amber-50 text-amber-700 border-amber-100"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 text-xs font-bold">
            <span className="text-[#2d4029]">Amount Authorized</span>
            <span className="font-serif text-sm text-[#2d4029]">
              ₱
              {(parseFloat(order.totalAmount) || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {!isPaid && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLoading(true);
                setErrorMessage(null);
                setPollCount(0);
                void fetchOrderInvoiceState(true);
              }}
              className="w-full rounded-xl text-xs font-bold border-gray-200 text-gray-500 h-10 order-2 sm:order-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </Button>
          )}

          <Button
            nativeButton={false}
            className={`w-full rounded-xl text-xs font-bold bg-[#4c6a46] hover:bg-[#3d5538] text-white h-10 shadow-md flex items-center justify-center gap-2 ${
              isPaid ? "" : "order-1 sm:order-2"
            }`}
            render={
              <Link to={`/orders/${order.orderId}`}>
                <span>Go to Order Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
