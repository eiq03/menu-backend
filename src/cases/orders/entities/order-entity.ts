import {
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { GuestCheck } from '../../guest-checks/guest-check.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  NEW = 'NEW',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERY = 'DELIVERY',
}

export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => GuestCheck, { nullable: false })
  @JoinColumn({ name: 'guest_check_id' })
  guestCheck: GuestCheck;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
