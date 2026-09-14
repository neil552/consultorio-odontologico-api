import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/database.module';
import { treatments } from '../drizzle/schema/treatments';
import { CrudService } from '../common/services/crud.service';
import { CrearTratamientoDto } from './dto/crear-tratamiento.dto';
@Injectable()
export class TratamientosService extends CrudService {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, treatments, 'Tratamiento');
  }
  create(dto: CrearTratamientoDto, userId: number) {
    return super.insert({
      ...dto,
      price: dto.price.toString(),
      createdBy: userId,
    });
  }
}
