import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicMenu() {
    const business = await this.prisma.business.findUnique({
      where: { slug: 'andre-burger' },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            products: {
              where: { isAvailable: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        additions: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        settings: true,
      },
    });

    return business;
  }
}
