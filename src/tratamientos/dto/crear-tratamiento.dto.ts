import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
export class CrearTratamientoDto {
  @ApiProperty({ example: 'LIM-001' }) @IsString() code!: string;
  @ApiProperty({ example: 'Limpieza dental' }) @IsString() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 45 }) @IsInt() @Min(1) durationMinutes!: number;
  @ApiProperty({ example: 85000 }) @IsNumber() @Min(0) price!: number;
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresAnesthesia?: boolean;
}
