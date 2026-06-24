import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAdditionDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  emoji?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
