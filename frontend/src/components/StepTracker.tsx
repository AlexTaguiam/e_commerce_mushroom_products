import React from "react";
import {
  Check,
  Truck,
  PackageCheck,
  FileText,
  RotateCwFadingClock,
  ShoppingBag,
} from "lucide-react";

type FulfillmentType = "pickup" | "delivery";
type OrderStatus =
  | "pending"
  | "confirmed"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled"
  | "needs_review";

interface StepTrackerProps {
  fulfillmentType: FulfillmentType;
  status: OrderStatus;
  variant?: "compact" | "expanded";
}

interface StepConfig {
  key: OrderStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function StepTracker({
  fulfillmentType,
  status,
  variant = "compact",
}: StepTrackerProps) {
  // 1. Handle the terminal cancelled fallback state cleanly
  if (status === "cancelled") {
    return (
      <div className="w-full bg-red-50/60 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
          <PackageCheck className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">
            Order Cancelled
          </h4>
          <p className="text-[11px] text-red-600 font-medium">
            This transaction pipeline was halted and voided.
          </p>
        </div>
      </div>
    );
  }

  if (status === "needs_review") {
    return (
      <div className="w-full bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <RotateCwFadingClock className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Order Under Review</h4>
          <p className="text-[11px] text-amber-700 font-medium">Your payment was received and the order needs staff review.</p>
        </div>
      </div>
    );
  }

  // 2. Map structural steps dynamically based on fulfillment type configuration
  const deliverySteps: StepConfig[] = [
    { key: "pending", label: "Pending", icon: RotateCwFadingClock },
    { key: "confirmed", label: "Confirmed", icon: FileText },
    { key: "ready", label: "Ready to Ship", icon: ShoppingBag },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
    { key: "completed", label: "Completed", icon: PackageCheck },
  ];

  const pickupSteps: StepConfig[] = [
    { key: "pending", label: "Pending", icon: RotateCwFadingClock },
    { key: "confirmed", label: "Confirmed", icon: FileText },
    { key: "ready", label: "Ready for Pickup", icon: ShoppingBag },
    { key: "completed", label: "Completed", icon: PackageCheck },
  ];

  const steps = fulfillmentType === "delivery" ? deliverySteps : pickupSteps;
  const currentStepIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="w-full font-sans py-2">
      <div className="relative flex items-center justify-between w-full">
        {/* Progress Track Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.75 bg-gray-200 rounded-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.75 bg-[#4c6a46] transition-all duration-500 rounded-full z-0"
          style={{
            width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Individual Step Nodes Matrix */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center relative z-10 flex-1"
            >
              {/* Node Visual Anchor Bubble */}
              <div
                className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                  variant === "expanded" ? "w-10 h-10" : "w-7 h-7"
                } ${
                  isCompleted
                    ? "bg-[#4c6a46] text-white"
                    : isActive
                      ? "bg-[#2d4029] text-white ring-4 ring-[#2d4029]/10"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                }`}
              >
                {isCompleted ? (
                  <Check
                    className={
                      variant === "expanded" ? "w-5 h-5" : "w-3.5 h-3.5"
                    }
                  />
                ) : (
                  <StepIcon
                    className={
                      variant === "expanded" ? "w-4 h-4" : "w-3.5 h-3.5"
                    }
                  />
                )}
              </div>

              {/* Step Labels - Hidden on highly constrained card components if space requires */}
              {variant === "expanded" ? (
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider mt-2 transition-colors ${
                    isActive
                      ? "text-[#2d4029]"
                      : isCompleted
                        ? "text-[#4c6a46]"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              ) : (
                <span
                  className={`text-[9px] font-bold mt-1 tracking-tight hidden sm:inline transition-colors ${
                    isActive ? "text-[#2d4029]" : "text-gray-400"
                  }`}
                >
                  {step.label.split(" ")[0]}{" "}
                  {/* Abbreviated string parsing for cards */}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
