import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCategoryDto } from '../presentation/dto/create-category.dto';
import { UpdateCategoryDto } from '../presentation/dto/update-category.dto';

@Injectable()
export class CategoriesService {
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

    return this.prisma.category.findMany({
      where: {
        businessId: business.id,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  async create(dto: CreateCategoryDto) {
    const business = await this.prisma.business.findUnique({
      where: { slug: 'andre-burger' },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado.');
    }

    return this.prisma.category.create({
      data: {
        businessId: business.id,
        name: dto.name,
        slug: this.slugify(dto.name),
        emoji: dto.emoji,
        sortOrder: dto.sortOrder || 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: 'Categoría eliminada correctamente.',
      id,
      deletedProducts: category.products.length,
    };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.name ? this.slugify(dto.name) : undefined,
        emoji: dto.emoji,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
      },
    });
  }
}
