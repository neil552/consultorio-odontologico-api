import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/database.module';
import { roles } from '../drizzle/schema/roles';
import { rethrowDatabaseError } from '../common/services/crud.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  create(dto: CreateRoleDto) {
    return this.db
      .insert(roles)
      .values(dto)
      .returning()
      .catch((error: any) => rethrowDatabaseError(error, 'Rol'));
  }
  findAll() {
    return this.db.select().from(roles);
  }

  async findOne(id: number) {
    const [role] = await this.db.select().from(roles).where(eq(roles.id, id));
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async update(id: number, data: Partial<CreateRoleDto>) {
    await this.findOne(id);
    try {
      const [role] = await this.db
        .update(roles)
        .set(data)
        .where(eq(roles.id, id))
        .returning();
      return role;
    } catch (error) {
      rethrowDatabaseError(error, 'Rol');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      const [role] = await this.db
        .delete(roles)
        .where(eq(roles.id, id))
        .returning();
      return role;
    } catch (error) {
      rethrowDatabaseError(error, 'Rol');
    }
  }
}
