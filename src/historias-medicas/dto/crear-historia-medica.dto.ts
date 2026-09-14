import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
export class CrearHistoriaMedicaDto {
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) patientId!: number;
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) appointmentId!: number;
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) treatmentId!: number;
  @ApiProperty({ example: 16 }) @IsString() toothNumber!: string;
  @ApiProperty({ example: 'Caries profunda' }) @IsString() diagnosis!: string;
  @ApiProperty({ example: 'Restauración con resina compuesta' })
  @IsString()
  procedureNotes!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() prescriptions?: string;
}
