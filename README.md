# EcoFlow

Base inicial de um MVP profissional para monitoramento inteligente de consumo de agua.

## Estrutura

- `apps/api`: API REST em Node.js, Fastify, Prisma e JWT.
- `apps/mobile`: app React Native com Expo, TypeScript, React Navigation, TanStack Query e Zustand.
- `packages/shared`: contratos e tipos compartilhados para evolucao futura.
- `docs`: documentacao complementar.

## Como iniciar

### 1. Instale as dependencias

```bash
npm install
```

### 2. Configure o backend

```bash
cp apps/api/.env.example apps/api/.env
```

Defina a `DATABASE_URL` do projeto Supabase Postgres.

### 3. Gere o Prisma Client

```bash
npm run prisma:generate
```

### 4. Rode a API

```bash
npm run dev:api
```

### 5. Rode o app mobile

```bash
npm run dev:mobile
```
