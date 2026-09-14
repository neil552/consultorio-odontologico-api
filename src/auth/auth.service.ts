import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '../drizzle/database.module';
import { roles } from '../drizzle/schema/roles';
import { users } from '../drizzle/schema/users';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: any,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const result = await this.db
      .select({ user: users, role: roles.name })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, dto.email))
      .limit(1);
    const account = result[0];
    if (
      !account ||
      account.user.deletedAt ||
      !(await bcrypt.compare(dto.password, account.user.password))
    )
      throw new UnauthorizedException('Credenciales inválidas');
    return {
      accessToken: await this.jwt.signAsync({
        sub: account.user.id,
        userId: account.user.id,
        role: account.role,
      }),
      user: {
        id: account.user.id,
        name: account.user.name,
        email: account.user.email,
        role: account.role,
      },
    };
  }
}
