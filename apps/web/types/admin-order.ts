export type AdminOrderStatus =
  | "PENDING_WHATSAPP"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type AdminOrderItemAddition = {
  id: string;
  additionNameSnapshot: string;
  additionPriceSnapshot: number;
  quantity: number;
  subtotal: number;
};

export type AdminOrderItem = {
  id: string;
  productNameSnapshot: string;
  productPriceSnapshot: number;
  emoji: string | null;
  quantity: number;
  subtotal: number;
  note: string | null;
  additions: AdminOrderItemAddition[];
};

export type AdminOrder = {
  id: string;
  orderCode: string;
  status: AdminOrderStatus;
  deliveryType: "PICKUP" | "DELIVERY";
  paymentMethod: "CASH" | "NEQUI" | "BANCOLOMBIA" | "QR";
  subtotal: number;
  total: number | null;
  deliveryFeeStatus: string;
  customerNote: string | null;
  customerName: string;
  customerPhone: string;
  address: string | null;
  neighborhood: string | null;
  reference: string | null;
  whatsappMessage: string | null;
  createdAt: string;
  items: AdminOrderItem[];
};
