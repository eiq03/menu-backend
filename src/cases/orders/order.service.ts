import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order';
import { Order, OrderStatus } from './entities/order-entity';
import { OrderItem } from './entities/order-item.entity';
import { GuestCheckService } from '../guest-checks/guest-check.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from '../products/product.service';
import { UpdateOrderStatusDto } from './dto/update-order-status';

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

  findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException('Pedido nao encontrada');
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);

    //Determino a sequencia obrigatoria de mudança de status
    // NEW - PREPARING - DONE - DELIVERED
    const nextStatus: Record<OrderStatus, OrderStatus | undefined> = {
      [OrderStatus.NEW]: OrderStatus.PREPARING,
      [OrderStatus.PREPARING]: OrderStatus.READY,
      [OrderStatus.READY]: OrderStatus.DELIVERY,
      [OrderStatus.DELIVERY]: undefined,
    };

    //verifico se o client esta enviando o status valido
    if (nextStatus[dto.status] !== dto.status) {
      throw new BadRequestException('Stauts Invalido');
    }

    //forco a mudanda de status
    order.status = dto.status;
    //gravo alteracao no banco
    return this.orderRepository.save(order);
  }
}
