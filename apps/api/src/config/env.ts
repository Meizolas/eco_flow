import { z } from "zod";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

const envFiles = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "apps/api/.env")
];

for (const path of envFiles) {
  if (existsSync(path)) {
    config({ path, override: false });
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), {
      message: "DATABASE_URL deve ser uma URL PostgreSQL valida."
    }),
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*")
});

type Env = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN: string;
};

export const env = envSchema.parse(process.env) as Env;
