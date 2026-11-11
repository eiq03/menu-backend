import { IsBIC, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class CreateCategoryDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    name?: string;

    @IsOptional()
    @IsUrl()
    icon?: string;
}