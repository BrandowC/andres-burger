import { Module } from '@nestjs/common';
import { MenuController } from './presentation/menu.controller';
import { MenuService } from './application/menu.service';

@Module({
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
