import { Module } from '@nestjs/common';
import { OrdersController } from './presentation/orders.controller';
import { OrdersService } from './application/orders.service';
import { WhatsappMessageService } from './application/whatsapp-message.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, WhatsappMessageService],
})
export class OrdersModule {}
