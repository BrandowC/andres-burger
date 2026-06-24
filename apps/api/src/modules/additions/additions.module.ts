import { Module } from '@nestjs/common';
import { AdditionsService } from './application/additions.service';
import { AdditionsController } from './presentation/additions.controller';

@Module({
  controllers: [AdditionsController],
  providers: [AdditionsService],
})
export class AdditionsModule {}
