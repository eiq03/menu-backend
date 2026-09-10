import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGuestCheckDto {
  @IsUUID()
  @IsNotEmpty()
  spotId: string;
}
