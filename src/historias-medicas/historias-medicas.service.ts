import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/database.module';
import { appointments } from '../drizzle/schema/appointments';
import { medicalRecords } from '../drizzle/schema/medical-records';
import { patients } from '../drizzle/schema/patients';
import { roles } from '../drizzle/schema/roles';
import { treatments } from '../drizzle/schema/treatments';
import { users } from '../drizzle/schema/users';
import { CrudService } from '../common/services/crud.service';
import { CrearHistoriaMedicaDto } from './dto/crear-historia-medica.dto';

@Injectable()
export class HistoriasMedicasService extends CrudService {
  constructor(@Inject(DRIZZLE) db: any) {
    super(db, medicalRecords, 'Historia médica');
  }
  async create(dto: CrearHistoriaMedicaDto, userId: number) {
    const [appointment] = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, dto.appointmentId),
          eq(appointments.patientId, dto.patientId),
          isNull(appointments.deletedAt),
        ),
      );
    const [patient] = await this.db
      .select({ id: patients.id })
      .from(patients)
      .where(and(eq(patients.id, dto.patientId), isNull(patients.deletedAt)));
    const [treatment] = await this.db
      .select({ id: treatments.id })
      .from(treatments)
      .where(
        and(eq(treatments.id, dto.treatmentId), isNull(treatments.deletedAt)),
      );
    const [dentist] = await this.db
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          eq(users.id, userId),
          eq(roles.name, 'Odontólogo'),
          isNull(users.deletedAt),
        ),
      );
    if (
      !appointment ||
      !patient ||
      !treatment ||
      !dentist ||
      appointment.dentistId !== userId
    )
      throw new BadRequestException(
        'La cita, paciente, tratamiento y odontólogo deben existir y coincidir',
      );
    return super.insert({ ...dto, dentistId: userId, createdBy: userId });
  }

  async update(id: number, data: Partial<CrearHistoriaMedicaDto>) {
    const current = await this.findOne(id);
    const patientId = data.patientId ?? current.patientId;
    const appointmentId = data.appointmentId ?? current.appointmentId;
    const treatmentId = data.treatmentId ?? current.treatmentId;

    const [appointment] = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.patientId, patientId),
          isNull(appointments.deletedAt),
        ),
      );
    const [patient] = await this.db
      .select({ id: patients.id })
      .from(patients)
      .where(and(eq(patients.id, patientId), isNull(patients.deletedAt)));
    const [treatment] = await this.db
      .select({ id: treatments.id })
      .from(treatments)
      .where(
        and(eq(treatments.id, treatmentId), isNull(treatments.deletedAt)),
      );
    if (
      !appointment ||
      !patient ||
      !treatment ||
      appointment.dentistId !== current.dentistId
    )
      throw new BadRequestException(
        'La cita, paciente, tratamiento y odontólogo deben existir y coincidir',
      );

    return super.update(id, data);
  }
}
