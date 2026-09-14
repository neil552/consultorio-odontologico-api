import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/database.module';
import { patients } from '../drizzle/schema/patients';
import { CrudService } from '../common/services/crud.service';
import { CrearPacienteDto } from './dto/crear-paciente.dto';

@Injectable()
export class PacientesService extends CrudService {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, patients, 'Paciente');
  }
  create(dto: CrearPacienteDto, userId: number) {
    return super.insert({ ...dto, createdBy: userId });
  }
}
