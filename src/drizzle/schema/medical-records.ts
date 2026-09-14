import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { appointments } from './appointments';
import { patients } from './patients';
import { treatments } from './treatments';
import { users } from './users';

export const medicalRecords = pgTable('medical_records', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .notNull()
    .references(() => patients.id),
  appointmentId: integer('appointment_id')
    .notNull()
    .references(() => appointments.id),
  treatmentId: integer('treatment_id')
    .notNull()
    .references(() => treatments.id),
  dentistId: integer('dentist_id')
    .notNull()
    .references(() => users.id),
  toothNumber: varchar('tooth_number', { length: 5 }).notNull(),
  diagnosis: text('diagnosis').notNull(),
  procedureNotes: text('procedure_notes').notNull(),
  prescriptions: text('prescriptions'),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
