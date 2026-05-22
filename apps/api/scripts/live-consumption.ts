const apiUrl = process.env.API_URL ?? "http://localhost:3333/api";
const email = process.env.SIM_EMAIL ?? "demo@ecoflow.app";
const password = process.env.SIM_PASSWORD ?? "senha12345";
const intervalMs = Number(process.env.SIM_INTERVAL_MS ?? 60_000);

type LoginResponse = {
  accessToken: string;
  user: {
    properties?: Array<{
      waterMeters?: Array<{ id: string }>;
    }>;
  };
};

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body}`);
  }

  return response.json() as Promise<T>;
}

async function login() {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

async function tick(token: string, meterId: string) {
  const hour = new Date().getHours();
  const base = hour >= 6 && hour <= 9 ? 6 : hour >= 18 && hour <= 22 ? 5 : 2.4;
  const amount = Number((base + Math.random() * 3).toFixed(2));

  await request(`/meters/${meterId}/readings/simulate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ amount })
  });

  console.log(`[${new Date().toLocaleTimeString("pt-BR")}] leitura enviada: ${amount}L`);
}

async function main() {
  const session = await login();
  const meterId = session.user.properties?.[0]?.waterMeters?.[0]?.id;

  if (!meterId) {
    throw new Error("Usuario sem hidrometro. Rode o seed antes do simulador.");
  }

  console.log(`Simulador ativo em ${apiUrl}. Enviando leitura a cada ${intervalMs / 1000}s.`);
  await tick(session.accessToken, meterId);
  setInterval(() => {
    tick(session.accessToken, meterId).catch((error) => console.error(error.message));
  }, intervalMs);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
