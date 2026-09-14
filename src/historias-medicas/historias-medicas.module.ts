import { Module } from '@nestjs/common';
import { HistoriasMedicasController } from './historias-medicas.controller';
import { HistoriasMedicasService } from './historias-medicas.service';
@Module({
  controllers: [HistoriasMedicasController],
  providers: [HistoriasMedicasService],
})
export class HistoriasMedicasModule {}
