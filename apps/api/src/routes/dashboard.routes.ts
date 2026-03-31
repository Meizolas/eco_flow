import { FastifyInstance } from "fastify";
import { dashboardController } from "../controllers/dashboard.controller";

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);
  app.get("/summary", dashboardController.summary);
}
