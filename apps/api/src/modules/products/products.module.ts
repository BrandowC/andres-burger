import { Module } from '@nestjs/common';
import { ProductsController } from './presentation/products.controller';
import { ProductsService } from './application/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
