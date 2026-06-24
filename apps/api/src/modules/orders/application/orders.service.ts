import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryFeeStatus,
  DeliveryType,
  OrderStatus,
} from '../../../generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto } from '../presentation/dto/create-order.dto';
import { WhatsappMessageService } from './whatsapp-message.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappMessageService: WhatsappMessageService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const businessSlug = createOrderDto.businessSlug || 'andre-burger';

    const business = await this.prisma.business.findUnique({
      where: { slug: businessSlug },
      include: {
        settings: true,
      },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado.');
    }

    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException(
        'El pedido debe tener al menos un producto.',
      );
    }

    if (
      createOrderDto.deliveryType === DeliveryType.DELIVERY &&
      (!createOrderDto.address || !createOrderDto.neighborhood)
    ) {
      throw new BadRequestException(
        'Para domicilio debes enviar dirección y barrio.',
      );
    }

    const productIds = createOrderDto.items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId: business.id,
        isAvailable: true,
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const additionIds = createOrderDto.items.flatMap(
      (item) => item.additions?.map((addition) => addition.additionId) || [],
    );

    const additions = await this.prisma.addition.findMany({
      where: {
        id: { in: additionIds },
        businessId: business.id,
        isActive: true,
      },
    });

    const additionMap = new Map(
      additions.map((addition) => [addition.id, addition]),
    );

    let subtotal = 0;

    const orderItemsData = createOrderDto.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new BadRequestException(
          `Producto no disponible o no encontrado: ${item.productId}`,
        );
      }

      const productSubtotal = product.price * item.quantity;

      const additionsData =
        item.additions?.map((itemAddition) => {
          const addition = additionMap.get(itemAddition.additionId);

          if (!addition) {
            throw new BadRequestException(
              `Adición no disponible o no encontrada: ${itemAddition.additionId}`,
            );
          }

          const quantity = itemAddition.quantity || 1;
          const additionSubtotal = addition.price * quantity;

          return {
            additionId: addition.id,
            additionNameSnapshot: addition.name,
            additionPriceSnapshot: addition.price,
            quantity,
            subtotal: additionSubtotal,
          };
        }) || [];

      const additionsSubtotal = additionsData.reduce(
        (acc, addition) => acc + addition.subtotal,
        0,
      );

      const itemSubtotal = productSubtotal + additionsSubtotal;

      subtotal += itemSubtotal;

      return {
        productId: product.id,
        productNameSnapshot: product.name,
        productPriceSnapshot: product.price,
        emoji: product.emoji,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        note: item.note,
        additions: additionsData,
      };
    });

    const deliveryFeeStatus =
      createOrderDto.deliveryType === DeliveryType.PICKUP
        ? DeliveryFeeStatus.NOT_APPLICABLE
        : DeliveryFeeStatus.PENDING_CONFIRMATION;

    const total =
      createOrderDto.deliveryType === DeliveryType.PICKUP ? subtotal : null;

    const orderCode = await this.generateOrderCode(business.id);

    const customer = await this.prisma.customer.create({
      data: {
        businessId: business.id,
        name: createOrderDto.customerName,
        phone: createOrderDto.customerPhone,
        address: createOrderDto.address,
        neighborhood: createOrderDto.neighborhood,
        reference: createOrderDto.reference,
        latitude: createOrderDto.latitude,
        longitude: createOrderDto.longitude,
      },
    });

    const whatsappMessage = this.whatsappMessageService.generateMessage({
      businessName: business.name,
      whatsappNumber: business.whatsappNumber,
      orderCode,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      deliveryType: createOrderDto.deliveryType,
      paymentMethod: createOrderDto.paymentMethod,
      address: createOrderDto.address,
      neighborhood: createOrderDto.neighborhood,
      reference: createOrderDto.reference,
      customerNote: createOrderDto.customerNote,
      subtotal,
      total,
      items: orderItemsData.map((item) => ({
        name: item.productNameSnapshot,
        emoji: item.emoji,
        quantity: item.quantity,
        unitPrice: item.productPriceSnapshot,
        subtotal: item.subtotal,
        note: item.note,
        additions: item.additions.map((addition) => ({
          name: addition.additionNameSnapshot,
          quantity: addition.quantity,
          price: addition.additionPriceSnapshot,
          subtotal: addition.subtotal,
        })),
      })),
    });

    const whatsappUrl = this.whatsappMessageService.generateWhatsappUrl(
      business.whatsappNumber,
      whatsappMessage,
    );

    const order = await this.prisma.order.create({
      data: {
        businessId: business.id,
        customerId: customer.id,
        orderCode,
        status: OrderStatus.PENDING_WHATSAPP,
        deliveryType: createOrderDto.deliveryType,
        paymentMethod: createOrderDto.paymentMethod,
        subtotal,
        total,
        deliveryFeeStatus,
        customerNote: createOrderDto.customerNote,
        whatsappMessage,
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        address: createOrderDto.address,
        neighborhood: createOrderDto.neighborhood,
        reference: createOrderDto.reference,
        latitude: createOrderDto.latitude,
        longitude: createOrderDto.longitude,
        items: {
          create: orderItemsData.map((item) => ({
            productId: item.productId,
            productNameSnapshot: item.productNameSnapshot,
            productPriceSnapshot: item.productPriceSnapshot,
            emoji: item.emoji,
            quantity: item.quantity,
            subtotal: item.subtotal,
            note: item.note,
            additions: {
              create: item.additions.map((addition) => ({
                additionId: addition.additionId,
                additionNameSnapshot: addition.additionNameSnapshot,
                additionPriceSnapshot: addition.additionPriceSnapshot,
                quantity: addition.quantity,
                subtotal: addition.subtotal,
              })),
            },
          })),
        },
        statusHistory: {
          create: {
            oldStatus: null,
            newStatus: OrderStatus.PENDING_WHATSAPP,
            note: 'Pedido creado desde la PWA del cliente.',
          },
        },
      },
      include: {
        items: {
          include: {
            additions: true,
          },
        },
      },
    });

    return {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
      subtotal: order.subtotal,
      total: order.total,
      whatsappMessage,
      whatsappUrl,
    };
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            additions: true,
          },
        },
      },
    });
  }

  async updateStatus(orderId: string, newStatus: OrderStatus, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado.');
    }

    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            oldStatus: order.status,
            newStatus,
            note: note || 'Estado actualizado desde el panel administrativo.',
          },
        },
      },
      include: {
        items: {
          include: {
            additions: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return updatedOrder;
  }

  private async generateOrderCode(businessId: string): Promise<string> {
    const count = await this.prisma.order.count({
      where: {
        businessId,
      },
    });

    const nextNumber = count + 1;

    return `AB-${String(nextNumber).padStart(4, '0')}`;
  }
}
