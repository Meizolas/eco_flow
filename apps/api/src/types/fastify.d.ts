import "@fastify/jwt";
import "fastify";

type AuthenticatedUser = {
  sub: string;
  email: string;
  role: string;
  type?: string;
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthenticatedUser;
    user: AuthenticatedUser;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: import("fastify").preHandlerHookHandler;
    config: {
      JWT_EXPIRES_IN: string;
      JWT_REFRESH_EXPIRES_IN: string;
      JWT_REFRESH_SECRET: string;
      CORS_ORIGIN: string;
      PORT: number;
      NODE_ENV: "development" | "test" | "production";
      DATABASE_URL: string;
      JWT_SECRET: string;
    };
  }
}
