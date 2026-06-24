export type TopProductReport = {
  productName: string;
  quantity: number;
  total: number;
};

export type RecentOrderReport = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  status: string;
  deliveryType: string;
  paymentMethod: string;
  subtotal: number;
  total: number | null;
  createdAt: string;
};

export type DashboardReport = {
  date: string;
  todayOrders: number;
  todaySales: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  topProducts: TopProductReport[];
  recentOrders: RecentOrderReport[];
};
