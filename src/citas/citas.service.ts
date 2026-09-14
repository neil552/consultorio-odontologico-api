import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/database.module';
import { appointments } from '../drizzle/schema/appointments';
import { patients } from '../drizzle/schema/patients';
import { roles } from '../drizzle/schema/roles';
import { users } from '../drizzle/schema/users';
import { CrudService } from '../common/services/crud.service';
import { CrearCitaDto } from './dto/crear-cita.dto';

@Injectable()
export class CitasService extends CrudService {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, appointments, 'Cita');
  }
  async create(dto: CrearCitaDto, userId: number) {
    const [patient] = await this.db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.id, dto.patientId));
    const [dentist] = await this.db
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          eq(users.id, dto.dentistId),
          eq(roles.name, 'Odontólogo'),
          isNull(users.deletedAt),
        ),
      );
    if (!patient || !dentist)
      throw new BadRequestException(
        'El paciente debe existir y el usuario debe tener el rol Odontólogo',
      );
    const scheduledAt = new Date(dto.scheduledAt);
    const [occupiedAppointment] = await this.db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.dentistId, dto.dentistId),
          eq(appointments.scheduledAt, scheduledAt),
          isNull(appointments.deletedAt),
        ),
      );
    if (occupiedAppointment)
      throw new ConflictException(
        'El odontólogo ya tiene una cita en ese horario',
      );
    return super.insert({
      ...dto,
      scheduledAt,
      createdBy: userId,
    });
  }

  async update(id: number, data: Partial<CrearCitaDto>) {
    const current = await this.findOne(id);
    const patientId = data.patientId ?? current.patientId;
    const dentistId = data.dentistId ?? current.dentistId;
    const scheduledAt = data.scheduledAt
      ? new Date(data.scheduledAt)
      : current.scheduledAt;

    const [patient] = await this.db
      .select({ id: patients.id })
      .from(patients)
      .where(and(eq(patients.id, patientId), isNull(patients.deletedAt)));
    const [dentist] = await this.db
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          eq(users.id, dentistId),
          eq(roles.name, 'Odontólogo'),
          isNull(users.deletedAt),
        ),
      );
    if (!patient || !dentist)
      throw new BadRequestException(
        'El paciente debe existir y el usuario debe tener el rol Odontólogo',
      );

    const [occupiedAppointment] = await this.db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.dentistId, dentistId),
          eq(appointments.scheduledAt, scheduledAt),
          isNull(appointments.deletedAt),
        ),
      );
    if (occupiedAppointment && occupiedAppointment.id !== id)
      throw new ConflictException(
        'El odontólogo ya tiene una cita en ese horario',
      );

    return super.update(id, {
      ...data,
      scheduledAt,
    });
  }
}
