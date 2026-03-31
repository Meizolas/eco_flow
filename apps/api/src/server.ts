import { buildApp } from "./app";
import { env } from "./config/env";

const app = buildApp();

app
  .listen({
    host: "0.0.0.0",
    port: env.PORT
  })
  .then(() => {
    app.log.info(`EcoFlow API running on port ${env.PORT}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
