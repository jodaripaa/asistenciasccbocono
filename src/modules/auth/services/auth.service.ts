import bcrypt from "bcryptjs";
import { prisma } from "@shared/database/prisma";
import { UnauthorizedError, ConflictError } from "@shared/errors/app-error";
import { signToken } from "@shared/utils/jwt";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";

const SALT_ROUNDS = 12;

function excludePassword<T extends { password: string }>(user: T): Omit<T, "password"> {
  const { password: _, ...rest } = user;
  return rest;
}

export class AuthService {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: excludePassword(user),
      token,
    };
  }

  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictError("El correo ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role ?? "REGISTRAR",
      },
    });

    return excludePassword(user);
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedError("Usuario no encontrado");
    }
    return excludePassword(user);
  }
}
