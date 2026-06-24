export type DeliveryType = "PICKUP" | "DELIVERY";

export type PaymentMethod = "CASH" | "NEQUI" | "BANCOLOMBIA" | "QR";

export type CreateOrderItemDto = {
  productId: string;
  quantity: number;
  note?: string;
  additions?: {
    additionId: string;
    quantity?: number;
  }[];
};

export type CreateOrderDto = {
  businessSlug?: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  address?: string;
  neighborhood?: string;
  reference?: string;
  latitude?: number;
  longitude?: number;
  customerNote?: string;
  items: CreateOrderItemDto[];
};

export type CreateOrderResponse = {
  orderId: string;
  orderCode: string;
  status: string;
  subtotal: number;
  total: number | null;
  whatsappMessage: string;
  whatsappUrl: string;
};
