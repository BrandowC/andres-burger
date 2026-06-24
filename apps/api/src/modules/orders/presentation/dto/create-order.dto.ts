import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  DeliveryType,
  PaymentMethod,
} from '../../../../generated/prisma/client';
class CreateOrderItemAdditionDto {
  @IsUUID()
  additionId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

class CreateOrderItemDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemAdditionDto)
  additions?: CreateOrderItemAdditionDto[];
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  businessSlug?: string;

  @IsNotEmpty()
  @IsString()
  customerName!: string;

  @IsNotEmpty()
  @IsString()
  customerPhone!: string;

  @IsEnum(DeliveryType)
  deliveryType!: DeliveryType;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  customerNote?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
