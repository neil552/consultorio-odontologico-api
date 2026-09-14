import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './drizzle/database.module';
import { AuthModule } from './auth/auth.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { TratamientosModule } from './tratamientos/tratamientos.module';
import { CitasModule } from './citas/citas.module';
import { HistoriasMedicasModule } from './historias-medicas/historias-medicas.module';
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    RolesModule,
    UsuariosModule,
    PacientesModule,
    TratamientosModule,
    CitasModule,
    HistoriasMedicasModule,
  ],
})
export class AppModule {}
