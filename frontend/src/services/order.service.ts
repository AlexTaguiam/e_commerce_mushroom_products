import { api } from "../api/client";
import { type Order, type OrderStatus } from "../types/order";
// import { type CartItem } from "@/types/cart";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateOrderPayload {
  fulfillmentType: "pickup" | "delivery";
  deliveryAddress?: string; // Optional for store pickup
  contactPhone: string;
  paymentMethod: "cod" | "gcash" | "card";
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface CreatePaymentIntentPayload {
  order_id: number;
  paymentMethod?: "gcash" | "card";
}

// orderId: result?.order.orderId,
// totalAmount: result?.order.totalAmount,
// itemsCoumt: result?.order.orderItems.length,
// paymentStatus: result?.order.status,

export interface OrderReturnData {
  orderId: string;
  totalAmount: number;
  itemsCount: number;
  paymentStatus: string;
}

export interface GetOrdersParams {
  status?: OrderStatus | string;
}

export interface OrdersListData {
  count: number;
  orders: Order[];
}

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<ApiResponse<OrderReturnData>> => {
  try {
    console.log("Payload inside create Order:", payload);
    const result = await api.post<ApiResponse<OrderReturnData>>(
      "/orders",
      payload,
    );
    console.log("Create Order Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in creating Order: ", error);
    throw error;
  }
};

export const getOrders = async (
  params?: GetOrdersParams,
): Promise<ApiResponse<OrdersListData>> => {
  try {
    const result = await api.get<ApiResponse<OrdersListData>>("/orders", {
      params,
    });
    console.log("Orders Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Orders: ", error);
    throw error;
  }
};

export const getOrderById = async (
  orderId: string | number,
): Promise<ApiResponse<Order>> => {
  try {
    const result = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    console.log("Order By Id Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in getting Order By Id: ", error);
    throw error;
  }
};

// --- Admin order operations (mounted at /api/orders, not /api/admin) ---

export const confirmOrder = async (
  orderId: number,
): Promise<ApiResponse<null>> => {
  try {
    const result = await api.patch<ApiResponse<null>>(
      `/orders/${orderId}/confirm`,
    );
    console.log("Confirm Order Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in confirming Order: ", error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus,
): Promise<ApiResponse<Order>> => {
  try {
    const result = await api.patch<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      { status },
    );
    console.log("Update Order Status Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in updating Order Status: ", error);
    throw error;
  }
};

export const cancelOrder = async (
  orderId: number,
): Promise<ApiResponse<Order>> => {
  try {
    const result = await api.patch<ApiResponse<Order>>(
      `/orders/${orderId}/cancel`,
    );
    console.log("Cancel Order Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in cancelling Order: ", error);
    throw error;
  }
};
