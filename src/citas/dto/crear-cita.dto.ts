import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum EstadoCitaDto {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
export class CrearCitaDto {
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) patientId!: number;
  @ApiProperty({ example: 2 }) @IsInt() @Min(1) dentistId!: number;
  @ApiProperty({ example: '2026-10-02T14:00:00.000Z' })
  @IsDateString()
  scheduledAt!: string;
  @ApiPropertyOptional({
    enum: EstadoCitaDto,
    default: EstadoCitaDto.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(EstadoCitaDto)
  status?: EstadoCitaDto;
  @ApiProperty({ example: 'Dolor en molar superior derecho' })
  @IsString()
  reason!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
