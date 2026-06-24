import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDto } from '../presentation/dto/create-product.dto';
import { UpdateProductDto } from '../presentation/dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async findAll() {
    const business = await this.prisma.business.findUnique({
      where: { slug: 'andre-burger' },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado.');
    }

    return this.prisma.product.findMany({
      where: {
        businessId: business.id,
      },
      include: {
        category: true,
      },
      orderBy: [
        {
          category: {
            sortOrder: 'asc',
          },
        },
        {
          sortOrder: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async create(dto: CreateProductDto) {
    const business = await this.prisma.business.findUnique({
      where: { slug: 'andre-burger' },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado.');
    }

    return this.prisma.product.create({
      data: {
        businessId: business.id,
        categoryId: dto.categoryId,
        name: dto.name,
        slug: this.slugify(dto.name),
        description: dto.description,
        price: dto.price,
        emoji: dto.emoji,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
        isFeatured: dto.isFeatured ?? false,
        sortOrder: dto.sortOrder || 0,
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: 'Producto eliminado correctamente.',
      id,
    };
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        slug: dto.name ? this.slugify(dto.name) : undefined,
        description: dto.description,
        price: dto.price,
        emoji: dto.emoji,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable,
        isFeatured: dto.isFeatured,
        sortOrder: dto.sortOrder,
      },
      include: {
        category: true,
      },
    });
  }
}
