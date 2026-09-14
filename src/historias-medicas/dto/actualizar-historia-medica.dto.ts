import { PartialType } from '@nestjs/swagger';
import { CrearHistoriaMedicaDto } from './crear-historia-medica.dto';
export class ActualizarHistoriaMedicaDto extends PartialType(
  CrearHistoriaMedicaDto,
) {}
