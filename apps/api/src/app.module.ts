import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BusinessModule } from './modules/business/business.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { AdditionsModule } from './modules/additions/additions.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MenuModule } from './modules/menu/menu.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BusinessModule,
    CategoriesModule,
    ProductsModule,
    AdditionsModule,
    OrdersModule,
    MenuModule,
    UploadsModule,
    AuthModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
