import { type Order, type OrderStatus } from "@/types/order";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface PrimaryAction {
  label: string;
  endpointType: "confirm" | "status";
  nextStatus?: OrderStatus;
  icon: LucideIcon;
  variant: "primary" | "success" | "indigo" | "purple";
}

export interface ActionConfig {
  primaryAction: PrimaryAction | null;
  canCancel: boolean;
}

/**
 * Encapsulates the order state transition rules.
 */
export function getOrderActions(order: Order): ActionConfig {
  const { status, fulfillmentType } = order;

  // Terminal states allow no further transitions
  if (status === "completed" || status === "cancelled" || status === "needs_review") {
    return { primaryAction: null, canCancel: false };
  }

  let primaryAction: PrimaryAction | null;

  switch (status) {
    case "pending":
      primaryAction = {
        label: "Confirm Order",
        endpointType: "confirm",
        icon: CheckCircle2,
        variant: "primary",
      };
      break;

    case "confirmed":
      primaryAction = {
        label: "Mark as Ready",
        endpointType: "status",
        nextStatus: "ready",
        icon: PackageCheck,
        variant: "indigo",
      };
      break;

    case "ready":
      if (fulfillmentType === "delivery") {
        primaryAction = {
          label: "Out for Delivery",
          endpointType: "status",
          nextStatus: "out_for_delivery",
          icon: Truck,
          variant: "purple",
        };
      } else {
        // Pickup fulfillment skips out_for_delivery
        primaryAction = {
          label: "Mark Completed",
          endpointType: "status",
          nextStatus: "completed",
          icon: Sparkles,
          variant: "success",
        };
      }
      break;

    case "out_for_delivery":
      primaryAction = {
        label: "Mark Completed",
        endpointType: "status",
        nextStatus: "completed",
        icon: Sparkles,
        variant: "success",
      };
      break;

    default:
      primaryAction = null;
  }

  return {
    primaryAction,
    canCancel: true, // Any non-terminal order can be cancelled
  };
}

export function getStatusBadgeConfig(status: OrderStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
    case "confirmed":
      return {
        label: "Confirmed",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    case "ready":
      return {
        label: "Ready",
        className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      };
    case "out_for_delivery":
      return {
        label: "Out for Delivery",
        className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      };
    case "needs_review":
      return {
        label: "Needs Review",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      };
  }
}
