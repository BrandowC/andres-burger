import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAdditionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
