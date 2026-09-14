import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { patients } from './patients';
import { users } from './users';

export const appointmentStatus = pgEnum('appointment_status', [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
]);

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id')
    .notNull()
    .references(() => patients.id),
  dentistId: integer('dentist_id')
    .notNull()
    .references(() => users.id),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  status: appointmentStatus('status').default('SCHEDULED').notNull(),
  reason: text('reason').notNull(),
  notes: text('notes'),
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
