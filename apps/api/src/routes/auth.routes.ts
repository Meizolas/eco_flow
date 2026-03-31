import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";

export async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController(new AuthService(app));

  app.post("/register", controller.register);
  app.post("/login", controller.login);
  app.post("/forgot-password", controller.forgotPassword);
  app.get("/me", { preHandler: [app.authenticate] }, controller.me);
}
