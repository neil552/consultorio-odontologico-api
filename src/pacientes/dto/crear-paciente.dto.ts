import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearPacienteDto {
  @ApiProperty({ example: 'CC-102030' }) @IsString() documentNumber!: string;
  @ApiProperty({ example: 'Ana' }) @IsString() firstName!: string;
  @ApiProperty({ example: 'García' }) @IsString() lastName!: string;
  @ApiProperty({ example: '1990-05-20' }) @IsISO8601() birthDate!: string;
  @ApiProperty({ example: '+57 300 123 4567' }) @IsString() phone!: string;
  @ApiPropertyOptional({ example: 'ana@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}
