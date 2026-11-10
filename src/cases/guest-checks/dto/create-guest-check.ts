import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateGuestCheckDto {
  @IsUUID()
  spotId: string;
}
