import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicMenu() {
    return this.prisma.business.findUnique({
      where: {
        slug: 'andre-burger',
      },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        phone: true,
        whatsappNumber: true,
        address: true,
        openingHours: true,
        settings: {
          select: {
            acceptsPickup: true,
            acceptsDelivery: true,
            manualDeliveryFee: true,
            primaryColor: true,
            secondaryColor: true,
          },
        },
        categories: {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            id: true,
            name: true,
            slug: true,
            emoji: true,
            sortOrder: true,
            products: {
              where: {
                isAvailable: true,
              },
              orderBy: {
                sortOrder: 'asc',
              },
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                price: true,
                emoji: true,
                imageUrl: true,
                isFeatured: true,
                sortOrder: true,
              },
            },
          },
        },
        additions: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            emoji: true,
            isActive: true,
          },
        },
      },
    });
  }
}
