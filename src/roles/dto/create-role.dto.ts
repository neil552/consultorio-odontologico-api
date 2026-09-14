import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Odontólogo' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name!: string;
}
