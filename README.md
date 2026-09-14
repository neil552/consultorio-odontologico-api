# API Consultorio Odontológico

API REST modular para la gestión de un consultorio odontológico.

Tecnologías principales:

- NestJS 11 y TypeScript.
- Drizzle ORM.
- PostgreSQL.
- JWT y bcrypt.
- class-validator y Swagger.

## Inicio rápido

Requisitos: Node.js, pnpm y PostgreSQL.

```powershell
pnpm install
copy .env.example .env
```

Configura `.env` con los datos de tu PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/consultorio_odontologico
JWT_SECRET=una-clave-segura
PORT=3000
```

Crea la base de datos si todavía no existe:

```sql
CREATE DATABASE consultorio_odontologico;
```

Genera y aplica las migraciones de Drizzle, y luego carga los datos iniciales:

```powershell
pnpm exec drizzle-kit generate
pnpm exec drizzle-kit migrate
pnpm db:seed
```

Inicia la API:

```powershell
pnpm start:dev
```

Swagger queda disponible en:

```text
http://localhost:3000/docs
```

Si pnpm bloquea scripts nativos, ejecuta `pnpm approve-builds` y habilita `bcrypt`, `esbuild` y los paquetes indicados por pnpm.

## Base de datos

La base tiene 6 tablas:

- `roles`: roles del personal.
- `users`: usuarios, credenciales, rol y auditoría.
- `patients`: datos de los pacientes.
- `treatments`: catálogo de tratamientos.
- `appointments`: citas entre pacientes y odontólogos.
- `medical_records`: historial clínico relacionado con cita, tratamiento y pieza dental.

Relaciones principales:

```text
roles 1:N users
users 1:N patients
users 1:N treatments
users 1:N appointments
users 1:N medical_records
patients 1:N appointments
patients 1:N medical_records
appointments 1:N medical_records
treatments 1:N medical_records
```

El modelo completo está en:

diagrama de proyecto.png

Las migraciones se encuentran en `drizzle/`.

## Estructura del código

Las carpetas de la aplicación están en español:

```text
src/
├── auth/
├── citas/
├── common/
├── drizzle/
├── historias-medicas/
├── pacientes/
├── roles/
├── tratamientos/
└── usuarios/
```

Los nombres de las tablas y rutas HTTP permanecen en inglés porque corresponden al esquema y a los endpoints ya definidos:

```text
/roles
/users
/patients
/treatments
/appointments
/medical-records
```

Cada módulo contiene controller, service, module y DTOs.

## Autenticación

El seed crea estos usuarios con la contraseña `Secret123!`:

| Usuario                     | Rol           |
| --------------------------- | ------------- |
| `admin@consultorio.com`     | Administrador |
| `dentista@consultorio.com`  | Odontólogo    |
| `recepcion@consultorio.com` | Recepcionista |

Cambia estas contraseñas en un entorno real.

Login:

```http
POST http://localhost:3000/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@consultorio.com",
  "password": "Secret123!"
}
```

La respuesta contiene `accessToken`. Para endpoints protegidos envíalo así:

```text
Authorization: Bearer TU_ACCESS_TOKEN
```

## Permisos

- `Administrador`: administra roles y usuarios, y puede acceder a los módulos clínicos.
- `Odontólogo`: gestiona tratamientos, citas e historias médicas.
- `Recepcionista`: gestiona pacientes y citas.

La autorización se implementa con `JwtAuthGuard`, `RolesGuard` y el decorador `@Roles()`.

## Endpoints

Todos los endpoints siguientes requieren JWT, excepto `/auth/login`.

### Roles

```text
POST   /roles
GET    /roles
GET    /roles/:id
PATCH  /roles/:id
PUT    /roles/:id
DELETE /roles/:id
```

Sólo el administrador puede administrar roles.

### Usuarios

```text
POST   /users
GET    /users
GET    /users/:id
PATCH  /users/:id
PUT    /users/:id
DELETE /users/:id
```

Las contraseñas se guardan con bcrypt y nunca se devuelven en las respuestas.

### Pacientes

```text
POST   /patients
GET    /patients
GET    /patients/:id
PATCH  /patients/:id
PUT    /patients/:id
DELETE /patients/:id
```

### Tratamientos

```text
POST   /treatments
GET    /treatments
GET    /treatments/:id
PATCH  /treatments/:id
PUT    /treatments/:id
DELETE /treatments/:id
```

### Citas

```text
POST   /appointments
GET    /appointments
GET    /appointments/:id
PATCH  /appointments/:id
PUT    /appointments/:id
DELETE /appointments/:id
```

Una cita sólo acepta un usuario con rol `Odontólogo`. No se permite el mismo odontólogo en dos citas activas con la misma fecha y hora.

### Historias médicas

```text
POST   /medical-records
GET    /medical-records
GET    /medical-records/:id
PATCH  /medical-records/:id
PUT    /medical-records/:id
DELETE /medical-records/:id
```

Una historia médica verifica que paciente, cita y tratamiento existan, estén activos y correspondan al odontólogo que atendió la cita.

## Ejemplos para Postman

### Crear usuario odontólogo

```http
POST http://localhost:3000/users
```

```json
{
  "name": "Dra. Laura Gómez",
  "email": "laura@consultorio.com",
  "password": "Secret123!",
  "roleId": 2
}
```

### Crear paciente

```http
POST http://localhost:3000/patients
```

```json
{
  "documentNumber": "CC-555555",
  "firstName": "María",
  "lastName": "López",
  "birthDate": "1992-08-15",
  "phone": "+57 300 555 5555",
  "email": "maria@email.com",
  "address": "Calle 20 # 10-15"
}
```

### Crear tratamiento

```http
POST http://localhost:3000/treatments
```

```json
{
  "code": "END-001",
  "name": "Tratamiento de conducto",
  "description": "Procedimiento endodóntico",
  "durationMinutes": 90,
  "price": 250000,
  "requiresAnesthesia": true
}
```

### Crear cita

```http
POST http://localhost:3000/appointments
```

```json
{
  "patientId": 1,
  "dentistId": 2,
  "scheduledAt": "2026-10-03T10:00:00.000Z",
  "status": "CONFIRMED",
  "reason": "Dolor dental",
  "notes": "Primera valoración"
}
```

Estados disponibles: `SCHEDULED`, `CONFIRMED`, `COMPLETED` y `CANCELLED`.

### Crear historia médica

```http
POST http://localhost:3000/medical-records
```

```json
{
  "patientId": 1,
  "appointmentId": 1,
  "treatmentId": 1,
  "toothNumber": "16",
  "diagnosis": "Caries profunda",
  "procedureNotes": "Restauración con resina compuesta",
  "prescriptions": "Control en 15 días"
}
```

## Validaciones y errores

La aplicación usa `ValidationPipe` global con:

```text
whitelist: true
forbidNonWhitelisted: true
transform: true
```

Los mensajes automáticos de validación están traducidos al español. Ejemplo:

```json
{
  "statusCode": 400,
  "message": [
    "email debe ser un correo electrónico válido",
    "password no tiene la longitud mínima requerida"
  ],
  "error": "Bad Request"
}
```

Respuestas comunes:

- `400 Bad Request`: datos inválidos o relaciones inexistentes.
- `401 Unauthorized`: falta JWT o las credenciales son incorrectas.
- `403 Forbidden`: el usuario no tiene el rol requerido.
- `404 Not Found`: registro inexistente o eliminado.
- `409 Conflict`: email, documento o código duplicado; también horario ocupado.

## Borrado lógico

El `DELETE` de las tablas de dominio no elimina físicamente el registro. Actualiza `deleted_at` y el registro deja de aparecer en los listados activos.

Ejemplo:

```http
DELETE http://localhost:3000/patients/1
```

El registro permanece en PostgreSQL para auditoría.

## Pruebas y validación

Compilar:

```powershell
pnpm run build
```

Formatear:

```powershell
pnpm format
```

Prueba e2e:

```powershell
pnpm test:e2e
```

Si pnpm reenvía mal los argumentos en PowerShell, ejecutar directamente:

```powershell
& .\node_modules\.bin\jest.cmd --config .\test\jest-e2e.json --runInBand
```

La prueba e2e valida que una ruta protegida rechace solicitudes sin token.

## Drizzle

Generar una migración:

```powershell
pnpm db:generate
```

Aplicar migraciones:

```powershell
pnpm db:migrate
```

Alternativa para desarrollo:

```powershell
pnpm db:push
```

Cargar datos iniciales:

```powershell
pnpm db:seed
```

No subas al repositorio `node_modules` ni `.env`. Sí debes incluir `.env.example`, las migraciones y la documentación.
