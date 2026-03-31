import { FastifyInstance } from "fastify";
import { limitController } from "../controllers/limit.controller";

export async function limitRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);
  app.get("/", limitController.list);
  app.put("/", limitController.upsert);
}
