import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '../drizzle/database.module';
import { users } from '../drizzle/schema/users';
import { roles } from '../drizzle/schema/roles';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { rethrowDatabaseError } from '../common/services/crud.service';

@Injectable()
export class UsuariosService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  private sanitize(user: any) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  async create(dto: CrearUsuarioDto) {
    try {
      const [user] = await this.db
        .insert(users)
        .values({ ...dto, password: await bcrypt.hash(dto.password, 12) })
        .returning();
      return this.sanitize(user);
    } catch (error) {
      rethrowDatabaseError(error, 'Usuario');
    }
  }

  async findAll() {
    const rows = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(isNull(users.deletedAt));
    return rows;
  }

  async findOne(id: number) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, dto: Partial<CrearUsuarioDto>) {
    await this.findOne(id);
    const data = {
      ...dto,
      ...(dto.password
        ? { password: await bcrypt.hash(dto.password, 12) }
        : {}),
    };
    if (!dto.password) delete (data as { password?: string }).password;
    try {
      const [user] = await this.db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return this.sanitize(user);
    } catch (error) {
      rethrowDatabaseError(error, 'Usuario');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    const [user] = await this.db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return this.sanitize(user);
  }
}
