import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { Order } from './entities/order-entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { GuestCheck } from '../guest-checks/guest-check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuestCheck, Product, Order, OrderItem])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
