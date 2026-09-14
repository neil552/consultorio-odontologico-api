import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsString, Min, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  @ApiProperty({ example: 'Carlos Pérez' }) @IsString() name!: string;
  @ApiProperty({ example: 'carlos@consultorio.com' }) @IsEmail() email!: string;
  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @MinLength(8)
  password!: string;
  @ApiProperty({ example: 2 }) @IsInt() @Min(1) roleId!: number;
}
