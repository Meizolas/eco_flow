import { consumptionRoutes } from "./routes/consumption-routes"
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import type { FastifyError } from "fastify";
import { env } from "./config/env";
import { registerRoutes } from "./routes";

export const buildApp = () => {
  const app = Fastify({
    logger: env.NODE_ENV === "development"
  });

  app.decorate("config", env);

  app.register(sensible);
  app.register(cors, {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN
  });
  app.register(jwt, {
    secret: env.JWT_SECRET
  });

  app.decorate("authenticate", async (request: import("fastify").FastifyRequest) => {
    await request.jwtVerify();
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error(error);

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        message: error.message
      });
    }

    return reply.status(500).send({
      message: "Erro interno do servidor."
    });
  });

  app.register(registerRoutes, { prefix: "/api" });

  app.register(consumptionRoutes)

  return app;
};
