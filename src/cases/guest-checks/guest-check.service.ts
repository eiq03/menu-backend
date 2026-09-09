import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestCheck, GuestCheckStatus } from './guest-check.entity';
import { CreateGuestCheckDto } from './dto/create-guest-check';
import { Spot } from '../spots/spot.entity';

@Injectable()
export class GuestCheckService {
  constructor(
    @InjectRepository(GuestCheck)
    private readonly guestCheckRepository: Repository<GuestCheck>,

    @InjectRepository(Spot)
    private readonly spotRepository: Repository<Spot>
  ) {}
  // Regra #1: Não se abre comanda em uma mesa inexistente
  async create(dto: CreateGuestCheckDto): Promise<GuestCheck> {
    const spot = await this.spotRepository.findOneBy({
      id: dto.spotId,
      active: true,
    });

    if (!spot) {
      throw new NotFoundException(
        'Não foi encontrada uma mesa ativa com esse ID ',
      );
    }

    // Regra #2: Não se abre comanda em uma mesa que já EXISTA uma comanda aberta
    const opened = await this.guestCheckRepository.exists({
      where: { spot: { id: dto.spotId }, Status: GuestCheckStatus.OPENED },
    });

    if (opened) {
      throw new ConflictException(
        'Já existe uma comanda aberta para essa mesa',
      );
    }

    // aqui grava o registro
    const guestCheck = this.guestCheckRepository.create({
      spot,
      Status: GuestCheckStatus.OPENED,
    });
    return this.guestCheckRepository.save(guestCheck);
  }
  async findOne(id: string): Promise<GuestCheck> {
    const guestCheck = await this.guestCheckRepository.findOneBy({ id });
    if (!guestCheck) {
      throw new NotFoundException('Comanda não encontrada');
    }
    return guestCheck;
  }

  async close(id: string): Promise<GuestCheck> {
    const guestCheck = await this.findOne(id);

    // Regra #1: só posso fechar comandas abertas
    if (guestCheck.Status === GuestCheckStatus.CLOSED) {
      throw new ConflictException('A comanda ja esta fechada');
    }

    // Regra #2: Não posso fehcar comandas com pedidos nao entregues
    //TO_DO: IMPLEMENTAR ISSO DPS (DIVIDA TECNICA)
    // Se chegou aqui, deu certo
    guestCheck.Status = GuestCheckStatus.CLOSED;

    return this.guestCheckRepository.save(guestCheck);
  }
}
