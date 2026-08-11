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
): Promise<ApiResponse<PaymentIntentData>> => {
  try {
    const result = await api.post<ApiResponse<PaymentIntentData>>(
      "/create-intent",
      { order_id: orderId },
    );
    console.log("Payment Intent Result: ", result.data);
    return result.data;
  } catch (error) {
    console.error("Error in creating Payment Intent: ", error);
    throw error;
  }
};
