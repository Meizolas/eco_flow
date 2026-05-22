# Roteiro de Slides - EcoFlow

## Slide 1 - Titulo

**EcoFlow: Monitoramento Inteligente de Consumo de Agua**

Subtitulo sugerido:

```txt
Aplicativo mobile para acompanhamento de consumo, alertas e limites em tempo quase real.
```

## Slide 2 - Problema

- Usuarios nao acompanham o consumo de agua diariamente.
- Vazamentos podem demorar a ser percebidos.
- Contas altas geralmente so sao percebidas no fim do mes.
- Falta uma interface simples para historico, limites e alertas.

## Slide 3 - Solucao

- Dashboard mobile com resumo de consumo.
- Leituras recebidas via API.
- Alertas para consumo acima do esperado.
- Historico filtravel por periodo.
- Configuracao de limites e perfil.

## Slide 4 - Arquitetura

Inserir diagrama simples:

```txt
Sensor/Simulador -> API Fastify -> PostgreSQL/Supabase -> App Expo
                                      |
                                      -> Alertas e Notificacoes
```

## Slide 5 - Dashboard

Inserir print da Dashboard.

Pontos para comentar:

- Gauge central de consumo.
- Comparacao com periodo anterior.
- Dica inteligente.
- Popup de notificacoes.

## Slide 6 - Historico e Graficos

Inserir print da tela Historico.

Pontos para comentar:

- Filtros Diario, Semanal, Mensal e Anual.
- Grafico de consumo por periodo.
- Pico, minimo, media e tendencia.

## Slide 7 - Alertas

Inserir print da tela Alertas.

Pontos para comentar:

- Avisos e alertas criticos.
- Possivel vazamento.
- Status de leitura nao lida.

## Slide 8 - Perfil e Configuracoes

Inserir print da tela Perfil.

Pontos para comentar:

- Foto de perfil.
- Dados da conta.
- Dispositivo atual.
- Limites configurados.
- Privacidade e ajuda.

## Slide 9 - Tempo Quase Real

Explicar:

- A API recebe leituras de consumo.
- O app atualiza automaticamente a cada minuto.
- Um simulador pode enviar leituras para demonstracao.

Comando do simulador:

```bash
npm run simulate:live --workspace @ecoflow/api
```

## Slide 10 - Tecnologias

- Expo SDK 54
- React Native
- Fastify
- Prisma
- PostgreSQL/Supabase
- Zustand
- React Query
- Zod

## Slide 11 - Resultados

- Interface mobile funcional.
- Fluxo completo de usuario.
- Backend estruturado.
- Pronto para receber dados reais via API.
- Base preparada para sensores IoT.

## Slide 12 - Proximos Passos

- Integrar sensor fisico.
- Adicionar push notifications.
- Usar Supabase Realtime ou WebSocket.
- Gerar relatorios mensais.
- Expandir para multiplos dispositivos.

