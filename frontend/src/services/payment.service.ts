import { api } from "../api/client";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaymentIntentData {
  checkout_url: string;
  payment_intent_id: string;
  client_key: string;
}

export const createPaymentIntent = async (
  orderId: number,
  paymentMethod: "gcash" | "card" | "paymongo",
): Promise<ApiResponse<PaymentIntentData>> => {
  try {
    const result = await api.post<ApiResponse<PaymentIntentData>>(
      "payments/create-intent",
      { order_id: orderId, paymentMethod },
    );
    console.log("Payment Intent Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in creating Payment Intent: ", error);
    throw error;
  }
};

export const createIntentForCart = async (payload: {
  fulfillmentType: string;
  deliveryAddress?: string;
  contactPhone: string;
  paymentMethod: "gcash" | "card";
  items: Array<{ productId: number; quantity: number }>;
}): Promise<ApiResponse<PaymentIntentData>> => {
  const result = await api.post<ApiResponse<PaymentIntentData>>(
    "payments/create-intent-for-cart",
    payload,
  );
  return result.data;
};

export type CartPaymentStatus =
  | { status: "paid"; orderId: number }
  | { status: "processing" }
  | { status: "failed" };

export const getCartPaymentStatus = async (
  paymentIntentId: string,
): Promise<ApiResponse<CartPaymentStatus>> => {
  const result = await api.get<ApiResponse<CartPaymentStatus>>(
    `payments/status/${paymentIntentId}`,
  );
  return result.data;
};
