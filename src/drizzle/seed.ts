import 'dotenv/config';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const password = await bcrypt.hash('Secret123!', 12);
  try {
    await pool.query(
      `INSERT INTO roles (name) VALUES ('Administrador'), ('Odontólogo'), ('Recepcionista') ON CONFLICT (name) DO NOTHING`,
    );

    const roleResult = await pool.query<{ id: number; name: string }>(
      `SELECT id, name FROM roles WHERE name IN ('Administrador', 'Odontólogo', 'Recepcionista')`,
    );
    const roleIds = Object.fromEntries(
      roleResult.rows.map((role) => [role.name, role.id]),
    );

    await pool.query(
      `INSERT INTO users (name, email, password, role_id)
       VALUES ($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12)
       ON CONFLICT (email) DO NOTHING`,
      [
        'Administrador',
        'admin@consultorio.com',
        password,
        roleIds['Administrador'],
        'Dr. Carlos Pérez',
        'dentista@consultorio.com',
        password,
        roleIds['Odontólogo'],
        'Recepcionista',
        'recepcion@consultorio.com',
        password,
        roleIds['Recepcionista'],
      ],
    );

    const usersResult = await pool.query<{ id: number; email: string }>(
      `SELECT id, email FROM users WHERE email IN ($1, $2, $3)`,
      [
        'admin@consultorio.com',
        'dentista@consultorio.com',
        'recepcion@consultorio.com',
      ],
    );
    const userIds = Object.fromEntries(
      usersResult.rows.map((user) => [user.email, user.id]),
    );

    await pool.query(
      `INSERT INTO treatments (code, name, description, duration_minutes, price, requires_anesthesia, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (code) DO NOTHING`,
      [
        'LIM-001',
        'Limpieza dental',
        'Profilaxis y remoción de placa bacteriana',
        45,
        85000,
        false,
        userIds['admin@consultorio.com'],
      ],
    );

    const patientResult = await pool.query<{ id: number }>(
      `INSERT INTO patients (document_number, first_name, last_name, birth_date, phone, email, address, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (document_number) DO UPDATE SET document_number = EXCLUDED.document_number
       RETURNING id`,
      [
        'CC-102030',
        'Ana',
        'García',
        '1990-05-20',
        '+57 300 123 4567',
        'ana@email.com',
        'Calle 10 # 20-30',
        userIds['admin@consultorio.com'],
      ],
    );
    const patientId = patientResult.rows[0].id;

    const treatmentResult = await pool.query<{ id: number }>(
      `SELECT id FROM treatments WHERE code = $1`,
      ['LIM-001'],
    );
    const appointmentDate = '2026-10-02T14:00:00.000Z';
    await pool.query(
      `INSERT INTO appointments (patient_id, dentist_id, scheduled_at, status, reason, notes, created_by)
       SELECT $1, $2, $3, 'CONFIRMED', $4, $5, $6
       WHERE NOT EXISTS (
         SELECT 1 FROM appointments WHERE dentist_id = $2 AND scheduled_at = $3
       )`,
      [
        patientId,
        userIds['dentista@consultorio.com'],
        appointmentDate,
        'Limpieza dental de control',
        'Datos iniciales para pruebas en Postman',
        userIds['recepcion@consultorio.com'],
      ],
    );

    console.log(
      `Seed completado: roles, 3 usuarios, paciente ${patientId}, tratamiento ${treatmentResult.rows[0].id} y cita de ejemplo`,
    );
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
