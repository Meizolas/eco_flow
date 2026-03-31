import { FastifyInstance } from "fastify";
import { propertyController } from "../controllers/property.controller";

export async function propertyRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);
  app.get("/", propertyController.list);
  app.post("/", propertyController.create);
  app.post("/meters", propertyController.createMeter);
}
