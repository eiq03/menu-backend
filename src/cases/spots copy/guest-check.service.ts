import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GuestCheck, GuestCheckStatus } from "./guest-check.entity";
import { CreateGuestCheckDto } from "./dto/create-guest-check";
import { Spot } from "../spots/spot.entity";
import { NotFoundError } from "rxjs";

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
      active: true
    });

    if (!spot) {
      throw new NotFoundException('Não foi encontrada uma mesa ativa com esse ID ');
    }

// Regra #2: Não se abre comanda em uma mesa que já EXISTA uma comanda aberta
    const opened = await this.guestCheckRepository.exists({
      where: { spot: { id: dto.spotId }, Status: GuestCheckStatus.OPENED }
    });

    if (opened) {
      throw new ConflictException('Já existe uma comanda aberta para essa mesa');
    }

    // aqui grava o registro
    const guestCheck = this.guestCheckRepository.create({
      spot,
      status: GuestCheckStatus.OPENED
    });
    return this.guestCheckRepository.save(guestCheck);

  }
  close (id: string): Promise<GuestCheck> {
    
  }