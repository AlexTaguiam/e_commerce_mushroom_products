export type OrderStatus =
  | "pending"
  | "confirmed"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type FulfillmentType = "pickup" | "delivery";
export type PaymentMethod = "cod" | "gcash" | "card" | "paymongo";
export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "pending"
  | "failed"
  | "cancelled";

export interface OrderItem {
  quantity: number;
  priceAtOrder: string;
  product: {
    name: string;
    imageUrl: string;
  };
}

export interface Order {
  orderId: number;
  userId: string;
  contactPhone: string | null;
  userName?: string;
  userEmail?: string;
  orderDate: string;
  fulfillmentType: FulfillmentType;
  deliveryAddress: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: string;
  orderItems: OrderItem[];
  payment?: {
    method: string;
    status: string;
  };
}
