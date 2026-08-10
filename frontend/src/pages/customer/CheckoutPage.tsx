import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Store,
  Banknote,
  Smartphone,
  ShoppingBag,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/cartContext"; // Adjust path based on absolute workspace layouts
import { createOrder } from "@/services/order.service";
import { createPaymentIntent } from "@/services/payment.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import OrderSuccessScreen from "@/components/checkout/OrderSuccessScreen";

interface FormValidationErrors {
  contactPhone?: string;
  deliveryAddress?: string;
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();

  // Checkout Matrix States
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "paymongo">("cod");

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  // Client Validation Engine
  const validateForm = (): boolean => {
    const trackingErrors: FormValidationErrors = {};
    const phoneRegex = /^[0-9+\-\s]{10,15}$/;

    if (!contactPhone.trim()) {
      trackingErrors.contactPhone = "A contact phone number is required.";
    } else if (!phoneRegex.test(contactPhone)) {
      trackingErrors.contactPhone =
        "Please provide a valid numeric telephone record string.";
    }

    if (fulfillmentType === "delivery" && !deliveryAddress.trim()) {
      trackingErrors.deliveryAddress =
        "A specific shipping delivery destination is required.";
    }

    setErrors(trackingErrors);
    return Object.keys(trackingErrors).length === 0;
  };

  const handleCheckoutSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Structural conversion matching back-end signature targets
    const payload = {
      fulfillmentType,
      deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress : "",
      contactPhone,
      paymentMethod,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: cartItems.map((item: any) => ({
        productId: item.productId || item.product?.id,
        quantity: item.quantity,
      })),
    };

    // eslint-disable-next-line no-useless-assignment, @typescript-eslint/no-explicit-any
    let createdOrder: any = null;

    try {
      // Step 1: Initialize Database Order Transaction Frame
      const orderResponse = await createOrder(payload);

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(
          orderResponse.message ||
            "Failed to initialize order instance allocations.",
        );
      }

      createdOrder = orderResponse.data;

      // Step 2: Branch Execution Pathways Based on Payment Methods
      if (paymentMethod === "cod") {
        clearCart();
        setPlacedOrder(createdOrder);
        toast.success("Your balance structure configuration cleared.");
      } else {
        // PayMongo Hosted Gateway Routine Check
        try {
          const intentResponse = await createPaymentIntent(createdOrder.orderId);

          if (intentResponse.data?.checkout_url) {
            clearCart();
            window.location.href = intentResponse.data.checkout_url;
          } else {
            throw new Error(
              "Missing payment redirection routing links context.",
            );
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (intentError: any) {
          console.error(
            "Intent generation failure state details:",
            intentError,
          );
          toast.error(
            `Your order #${createdOrder.orderId} was created, but initialization with PayMongo failed. Please visit your Orders panel to re-try payment clearance.`,
          );
          setIsSubmitting(false);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Order pipeline submission collision tracking:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "System fault runtime processing error.",
      );
      setIsSubmitting(false);
    }
  };

  // Condition 1: Inline COD Confirmation Screen Trigger Block
  if (placedOrder) {
    return (
      <div className="w-full min-h-screen bg-[#faf8f4]">
        <OrderSuccessScreen
          orderId={placedOrder.orderId}
          totalAmount={parseFloat(placedOrder.totalAmount) || cartTotal}
          fulfillmentType={placedOrder.fulfillmentType}
        />
      </div>
    );
  }

  // Condition 2: Empty Cart Component State Handler UI Elements
  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-[70vh] bg-[#faf8f4] flex flex-col items-center justify-center px-4 font-sans text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#2d4029] mb-1.5">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-gray-400 font-medium max-w-xs mb-6 leading-relaxed">
          You must select allocations before entering the payment pipeline
          stages.
        </p>
        <Button
          asChild
          className="bg-[#4c6a46] hover:bg-[#3d5538] text-white rounded-xl shadow-md font-semibold text-xs px-6 h-10"
        >
          <Link to="/catalog">Browse Our Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#faf8f4] font-sans antialiased py-8 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center">
          <Button
            asChild
            variant="ghost"
            className="text-[#4c6a46] hover:text-[#3d5538] hover:bg-[#4c6a46]/5 rounded-xl font-semibold text-xs gap-2 -ml-2"
          >
            <Link to="/cart">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Shopping Cart</span>
            </Link>
          </Button>
        </div>

        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2d4029]">
          Checkout Allocation
        </h1>

        <form
          onSubmit={handleCheckoutSubmission}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column: Form Parameters Formulations */}
          <div className="lg:col-span-7 bg-white border border-gray-200/60 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
            {/* Component Item 1: Fulfillment Selection Configuration Context */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#2d4029]">
                Fulfillment Framework Method
              </Label>
              <RadioGroup
                value={fulfillmentType}
                onValueChange={(val: "delivery" | "pickup") => {
                  setFulfillmentType(val);
                  // Clean dependent state warnings triggers if moving off delivery pathways
                  if (val === "pickup")
                    setErrors((prev) => ({
                      ...prev,
                      deliveryAddress: undefined,
                    }));
                }}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="delivery"
                    id="type-delivery"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="type-delivery"
                    className={`flex items-center gap-3 border rounded-2xl p-4 cursor-pointer hover:bg-gray-50/50 transition-all ${
                      fulfillmentType === "delivery"
                        ? "border-[#4c6a46] bg-[#4c6a46]/5 text-[#2d4029] ring-1 ring-[#4c6a46]"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <Truck
                      className={`w-4 h-4 ${fulfillmentType === "delivery" ? "text-[#4c6a46]" : "text-gray-400"}`}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">
                        Standard Delivery
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        To shipping address
                      </span>
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="pickup"
                    id="type-pickup"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="type-pickup"
                    className={`flex items-center gap-3 border rounded-2xl p-4 cursor-pointer hover:bg-gray-50/50 transition-all ${
                      fulfillmentType === "pickup"
                        ? "border-[#4c6a46] bg-[#4c6a46]/5 text-[#2d4029] ring-1 ring-[#4c6a46]"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <Store
                      className={`w-4 h-4 ${fulfillmentType === "pickup" ? "text-[#4c6a46]" : "text-gray-400"}`}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Store Pickup</span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Collect directly at hub
                      </span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Component Item 2: Conditional Address Inputs Segmentations */}
            {fulfillmentType === "delivery" && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <Label
                  htmlFor="address-input"
                  className="text-xs font-bold uppercase tracking-wider text-[#2d4029]"
                >
                  Shipping Destination Address
                </Label>
                <Input
                  id="address-input"
                  type="text"
                  placeholder="Street Name, Barangay, City, Province"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className={`rounded-xl text-xs h-10 border-gray-200 focus-visible:ring-[#4c6a46] ${
                    errors.deliveryAddress
                      ? "border-red-300 focus-visible:ring-red-400"
                      : ""
                  }`}
                />
                {errors.deliveryAddress && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1">
                    {errors.deliveryAddress}
                  </p>
                )}
              </div>
            )}

            {/* Component Item 3: Contact Details Allocations Matrices */}
            <div className="space-y-2">
              <Label
                htmlFor="phone-input"
                className="text-xs font-bold uppercase tracking-wider text-[#2d4029]"
              >
                Contact Telephone String
              </Label>
              <Input
                id="phone-input"
                type="tel"
                placeholder="0917XXXXXXX or +63XXXXXXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={`rounded-xl text-xs h-10 border-gray-200 focus-visible:ring-[#4c6a46] ${
                  errors.contactPhone
                    ? "border-red-300 focus-visible:ring-red-400"
                    : ""
                }`}
              />
              {errors.contactPhone && (
                <p className="text-red-500 text-[11px] font-semibold mt-1">
                  {errors.contactPhone}
                </p>
              )}
            </div>

            {/* Component Item 4: Payment Network Route Providers Options */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-[#2d4029]">
                Payment Gateway Matrix
              </Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(val: "cod" | "paymongo") =>
                  setPaymentMethod(val)
                }
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="cod"
                    id="pay-cod"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="pay-cod"
                    className={`flex items-center gap-3 border rounded-2xl p-4 cursor-pointer hover:bg-gray-50/50 transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#4c6a46] bg-[#4c6a46]/5 text-[#2d4029] ring-1 ring-[#4c6a46]"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <Banknote
                      className={`w-4 h-4 ${paymentMethod === "cod" ? "text-[#4c6a46]" : "text-gray-400"}`}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">
                        Cash On Delivery
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Settle manually at receipt
                      </span>
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="paymongo"
                    id="pay-paymongo"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="pay-paymongo"
                    className={`flex items-center gap-3 border rounded-2xl p-4 cursor-pointer hover:bg-gray-50/50 transition-all ${
                      paymentMethod === "paymongo"
                        ? "border-[#4c6a46] bg-[#4c6a46]/5 text-[#2d4029] ring-1 ring-[#4c6a46]"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <Smartphone
                      className={`w-4 h-4 ${paymentMethod === "paymongo" ? "text-[#4c6a46]" : "text-gray-400"}`}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">
                        GCash / Card Gateway
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Secured via PayMongo
                      </span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Right Column: Dynamic Invoice Ledger Aggregation Summaries */}
          <div className="lg:col-span-5 bg-white border border-gray-200/60 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d4029] border-b border-gray-100 pb-2.5">
              Order Allotment Summary
            </h3>

            {/* Read-only Allocation Items Loop Pipeline */}
            <div className="divide-y divide-gray-100 max-h-[30vh] overflow-y-auto pr-1">
              {/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
              {cartItems.map((item: any, i: number) => {
                const price =
                  parseFloat(item.priceAtOrder || item.product?.price) || 0;
                const lineTotal = price * item.quantity;
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="overflow-hidden space-y-0.5">
                      <span className="text-xs font-bold text-[#2d4029] block truncate">
                        {item.product?.name || "Inventory Allocation"}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium block">
                        ₱{price.toLocaleString()} × {item.quantity}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#2d4029] shrink-0 font-serif">
                      ₱
                      {lineTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Fee Calculations Structuring Block */}
            <div className="border-t border-gray-200/60 pt-4 space-y-2.5 text-xs font-medium text-gray-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-[#2d4029] font-semibold">
                  ₱
                  {cartTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span>Logistics Fulfillment</span>
                <span className="text-[#2d4029] font-semibold">
                  {fulfillmentType === "delivery" ? "₱0.00" : "FREE"}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-[#2d4029]">
                  Total Execution Balance
                </span>
                <span className="font-serif font-bold text-xl text-[#2d4029]">
                  ₱
                  {cartTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Action Directing Dispatch Buttons Layouts */}
            <Button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full rounded-xl text-xs font-bold uppercase tracking-wider h-11 shadow-md bg-[#4c6a46] hover:bg-[#3d5538] text-white transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Checkout Pipelines...</span>
                </span>
              ) : (
                <span>Place Order Allocation</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
