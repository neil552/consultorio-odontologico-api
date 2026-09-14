import { NotFoundException } from '@nestjs/common';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';

export function rethrowDatabaseError(error: any, resourceName: string): never {
  if (error?.code === '23505') {
    throw new ConflictException(`${resourceName} ya existe`);
  }
  if (error?.code === '23503') {
    throw new BadRequestException(
      `La relación asociada a ${resourceName} no existe`,
    );
  }
  throw error;
}

export class CrudService {
  constructor(
    protected readonly db: any,
    protected readonly table: any,
    protected readonly resourceName: string,
  ) {}

  async insert(data: any) {
    try {
      const [row] = await this.db.insert(this.table).values(data).returning();
      return row;
    } catch (error) {
      rethrowDatabaseError(error, this.resourceName);
    }
  }
  async findAll() {
    return this.db
      .select()
      .from(this.table)
      .where(isNull(this.table.deletedAt));
  }
  async findOne(id: number) {
    const [row] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));
    if (!row || row.deletedAt)
      throw new NotFoundException(`${this.resourceName} no encontrado`);
    return row;
  }
  async update(id: number, data: any) {
    await this.findOne(id);
    try {
      const [row] = await this.db
        .update(this.table)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(this.table.id, id))
        .returning();
      return row;
    } catch (error) {
      rethrowDatabaseError(error, this.resourceName);
    }
  }
  async remove(id: number) {
    await this.findOne(id);
    const [row] = await this.db
      .update(this.table)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(this.table.id, id))
      .returning();
    return row;
  }
}
