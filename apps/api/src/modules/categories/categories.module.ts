import { Module } from '@nestjs/common';
import { CategoriesController } from './presentation/categories.controller';
import { CategoriesService } from './application/categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
