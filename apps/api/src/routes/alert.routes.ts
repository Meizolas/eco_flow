import { FastifyInstance } from "fastify";
import { alertController } from "../controllers/alert.controller";

export async function alertRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);
  app.get("/alerts", alertController.listAlerts);
  app.get("/notifications", alertController.listNotifications);
  app.patch("/notifications/read", alertController.markAsRead);
}
