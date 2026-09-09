import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Spot } from '../spots/spot.entity';

export enum GuestCheckStatus {
  OPENED = 'open',
  CLOSED = 'closed',
  CANCELED = 'canceled',
}

@Entity('guest-check')
export class GuestCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: GuestCheckStatus,
    default: GuestCheckStatus.OPENED,
  })
  Status: GuestCheckStatus;

  @ManyToOne(() => Spot, { nullable: false })
  @JoinColumn({ name: 'spot_id' })
  spot: Spot;
}
