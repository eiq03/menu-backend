/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGuestCheckDto {
  @IsUUID()
  @IsNotEmpty()
  spotId: string;
}
