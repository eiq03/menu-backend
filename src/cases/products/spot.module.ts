import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spot } from './product.entity';
import SpotController from './spot.controller';
import { SpotService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Spot])],
  controllers: { SpotController },
  providers: [SpotService],
})
export class SpotModule {}
