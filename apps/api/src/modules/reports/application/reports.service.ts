import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardReport() {
    const business = await this.prisma.business.findUnique({
      where: {
        slug: 'andre-burger',
      },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado.');
    }

    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const todayOrders = await this.prisma.order.findMany({
      where: {
        businessId: business.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: true,
      },
    });

    const validOrders = todayOrders.filter(
      (order) => order.status !== OrderStatus.CANCELLED,
    );

    const todaySales = validOrders.reduce((acc, order) => {
      return acc + order.subtotal;
    }, 0);

    const pendingOrders = todayOrders.filter(
      (order) => order.status === OrderStatus.PENDING_WHATSAPP,
    ).length;

    const confirmedOrders = todayOrders.filter(
      (order) => order.status === OrderStatus.CONFIRMED,
    ).length;

    const deliveredOrders = todayOrders.filter(
      (order) => order.status === OrderStatus.DELIVERED,
    ).length;

    const cancelledOrders = todayOrders.filter(
      (order) => order.status === OrderStatus.CANCELLED,
    ).length;

    const productMap = new Map<
      string,
      {
        productName: string;
        quantity: number;
        total: number;
      }
    >();

    for (const order of validOrders) {
      for (const item of order.items) {
        const current = productMap.get(item.productNameSnapshot);

        if (current) {
          current.quantity += item.quantity;
          current.total += item.subtotal;
        } else {
          productMap.set(item.productNameSnapshot, {
            productName: item.productNameSnapshot,
            quantity: item.quantity,
            total: item.subtotal,
          });
        }
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const recentOrders = todayOrders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map((order) => ({
        id: order.id,
        orderCode: order.orderCode,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        status: order.status,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        total: order.total,
        createdAt: order.createdAt,
      }));

    return {
      date: now,
      todayOrders: todayOrders.length,
      todaySales,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      topProducts,
      recentOrders,
    };
  }
}
