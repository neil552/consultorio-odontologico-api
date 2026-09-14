import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { HistoriasMedicasService } from './historias-medicas.service';
import { CrearHistoriaMedicaDto } from './dto/crear-historia-medica.dto';
import { ActualizarHistoriaMedicaDto } from './dto/actualizar-historia-medica.dto';
@ApiTags('Historias médicas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMINISTRADOR, Role.ODONTOLOGO)
@Controller('medical-records')
export class HistoriasMedicasController {
  constructor(private readonly service: HistoriasMedicasService) {}
  @Post() create(
    @Body() dto: CrearHistoriaMedicaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(dto, user.userId);
  }
  @Get() findAll() {
    return this.service.findAll();
  }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Patch(':id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarHistoriaMedicaDto,
  ) {
    return this.service.update(id, dto);
  }
  @Put(':id') replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearHistoriaMedicaDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
