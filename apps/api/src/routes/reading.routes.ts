import { FastifyInstance } from "fastify";
import { readingController } from "../controllers/reading.controller";

export async function readingRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);
  app.post("/:meterId/readings", readingController.create);
  app.get("/:meterId/readings", readingController.list);
}
