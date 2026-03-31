import { FastifyInstance } from "fastify";
import { alertRoutes } from "./alert.routes";
import { authRoutes } from "./auth.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { limitRoutes } from "./limit.routes";
import { propertyRoutes } from "./property.routes";
import { readingRoutes } from "./reading.routes";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok", service: "EcoFlow API" }));
  app.register(authRoutes, { prefix: "/auth" });
  app.register(propertyRoutes, { prefix: "/properties" });
  app.register(readingRoutes, { prefix: "/meters" });
  app.register(dashboardRoutes, { prefix: "/dashboard" });
  app.register(limitRoutes, { prefix: "/limits" });
  app.register(alertRoutes, { prefix: "/" });
}
