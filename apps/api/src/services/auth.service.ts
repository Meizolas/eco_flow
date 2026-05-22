import { FastifyInstance } from "fastify";
import { compareHash, hashValue } from "../utils/hash";
import { userRepository } from "../repositories/user.repository";
import { ForgotPasswordInput, LoginInput, RegisterInput } from "../schemas/auth.schemas";
import { prisma } from "../lib/prisma";

export class AuthService {
  constructor(private readonly app: FastifyInstance) {}

  async register(input: RegisterInput, userAgent?: string, ipAddress?: string) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw this.app.httpErrors.conflict("Ja existe uma conta com este email.");
    }

    const passwordHash = await hashValue(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash
    });

    return this.buildSession(user.id, user.email, user.role, userAgent, ipAddress);
  }

  async login(input: LoginInput, userAgent?: string, ipAddress?: string) {
    const user = await userRepository.findByEmail(input.email);

    if (!user || !(await compareHash(input.password, user.passwordHash))) {
      throw this.app.httpErrors.unauthorized("Email ou senha invalidos.");
    }

    return this.buildSession(user.id, user.email, user.role, userAgent, ipAddress);
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        properties: {
          include: {
            waterMeters: true
          }
        }
      }
    });

    if (!user) {
      throw this.app.httpErrors.notFound("Usuario nao encontrado.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      properties: user.properties
    };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(input.email);

    return {
      message:
        user != null
          ? "Fluxo de recuperacao preparado. Integre um provedor de email para envio do token."
          : "Se o email existir, enviaremos as instrucoes de recuperacao."
    };
  }

  private async buildSession(
    userId: string,
    email: string,
    role: string,
    userAgent?: string,
    ipAddress?: string
  ) {
    const accessToken = await this.app.jwt.sign(
      { sub: userId, email, role },
      {
        sub: userId,
        expiresIn: this.app.config.JWT_EXPIRES_IN
      }
    );

    const refreshToken = await this.app.jwt.sign(
      { sub: userId, email, role, type: "refresh" },
      {
        sub: userId,
        key: this.app.config.JWT_REFRESH_SECRET,
        expiresIn: this.app.config.JWT_REFRESH_EXPIRES_IN
      }
    );

    await prisma.authSession.create({
      data: {
        userId,
        refreshTokenHash: await hashValue(refreshToken),
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return {
      accessToken,
      refreshToken,
      user: await this.me(userId)
    };
  }
}
