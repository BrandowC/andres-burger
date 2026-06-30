import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAdditionDto } from '../presentation/dto/create-addition.dto';
import { UpdateAdditionDto } from '../presentation/dto/update-addition.dto';

@Injectable()
export class AdditionsService {
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
      where: {
        slug: 'andre-burger',
      },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado.');
    }

    return this.prisma.addition.findMany({
      where: {
        businessId: business.id,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async create(dto: CreateAdditionDto) {
    const business = await this.prisma.business.findUnique({
      where: {
        slug: 'andre-burger',
      },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado.');
    }

    return this.prisma.addition.create({
      data: {
        businessId: business.id,
        name: dto.name,
        slug: this.slugify(dto.name),
        price: dto.price,
        emoji: dto.emoji,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateAdditionDto) {
    const addition = await this.prisma.addition.findUnique({
      where: {
        id,
      },
    });

    if (!addition) {
      throw new NotFoundException('Adición no encontrada.');
    }

    return this.prisma.addition.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        slug: dto.name ? this.slugify(dto.name) : undefined,
        price: dto.price,
        emoji: dto.emoji,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    const addition = await this.prisma.addition.findUnique({
      where: {
        id,
      },
    });

    if (!addition) {
      throw new NotFoundException('Adición no encontrada.');
    }

    /*
      No la borramos físicamente porque puede estar relacionada con pedidos antiguos.
      Mejor la dejamos inactiva para que no aparezca disponible al cliente.
    */
    return this.prisma.addition.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }
}
