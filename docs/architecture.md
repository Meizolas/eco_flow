# EcoFlow Architecture Notes

## MVP Goal

Deliver a mobile app capable of:

- authenticating users;
- registering properties and water meters;
- receiving consumption readings through the API;
- calculating averages, trend and anomalies;
- generating alerts and in-app notifications;
- showing clear dashboards for non-technical users.

## Architecture Decision

- `Fastify` in the backend for performance, predictable validation and mature plugins.
- `Prisma` to keep strong typing over Supabase Postgres.
- `Expo + React Native` to speed up mobile delivery without sacrificing UX.
- `TanStack Query` for remote state and cache.
- `Zustand` for lightweight session state.
