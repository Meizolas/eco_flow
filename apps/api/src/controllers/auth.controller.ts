import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";
import { forgotPasswordSchema, loginSchema, registerSchema } from "../schemas/auth.schemas";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = registerSchema.parse(request.body);
    const session = await this.authService.register(
      input,
      request.headers["user-agent"],
      request.ip
    );

    return reply.code(201).send(session);
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = loginSchema.parse(request.body);
    const session = await this.authService.login(input, request.headers["user-agent"], request.ip);

    return reply.send(session);
  };

  forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = forgotPasswordSchema.parse(request.body);
    const result = await this.authService.forgotPassword(input);
    return reply.send(result);
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await this.authService.me(request.user.sub);
    return reply.send(user);
  };
}
