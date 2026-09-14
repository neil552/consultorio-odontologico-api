import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
  date,
  text,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  documentNumber: varchar('document_number', { length: 30 }).notNull().unique(),
  firstName: varchar('first_name', { length: 80 }).notNull(),
  lastName: varchar('last_name', { length: 80 }).notNull(),
  birthDate: date('birth_date').notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  email: varchar('email', { length: 180 }),
  address: text('address'),
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
