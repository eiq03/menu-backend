import { Injectable } from '@nestjs/common';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order';
import { Order, OrderStatus } from './entities/order-entity';
import { OrderItem } from './entities/order-item.entity';
import { GuestCheckService } from '../guest-checks/guest-check.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from '../products/product.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly guestCheckService: GuestCheckService,
    private readonly productService: ProductService,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  private async prepareItems(itemDto: CreateOrderItemDto): Promise<OrderItem> {
    const product = await this.productService.findOne(itemDto.productId);
    const subtotal = Number(product.price) * itemDto.quantity;

    return this.orderItemRepository.create({
      product,
      quantity: itemDto.quantity,
      subtotal,
    });
  }
  async create(dto: CreateOrderDto): Promise<Order> {
    // regra 1: verificar se tem comanda em aberto para o spot
    const guestCheck = await this.guestCheckService.findOrCreateOpened(
      dto.spotId,
    );

    //monta no totalizador do pedido
    const items: OrderItem[] = [];
    let total = 0;

    for (const itemDto of dto.items) {
      const item = await this.prepareItems(itemDto);
      items.push(item);
      total += Number(item.subtotal);
    }

    //monta o pedido
    const order = this.orderRepository.create({
      guestCheck,
      status: OrderStatus.NEW,
      total,
      items,
    });
    return this.orderRepository.save(order);
  }
}
