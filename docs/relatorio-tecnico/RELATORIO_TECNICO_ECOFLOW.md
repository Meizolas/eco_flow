# Relatorio Tecnico - EcoFlow

## 1. Visao Geral

O EcoFlow e um aplicativo mobile para monitoramento inteligente de consumo de agua. A proposta e centralizar leituras de consumo, alertas, limites, historico e informacoes do perfil em uma experiencia simples para o usuario final.

O aplicativo foi pensado para receber leituras via API, atualizar a dashboard automaticamente e permitir acompanhamento continuo sem que o usuario precise atualizar a tela manualmente.

## 2. Objetivo do Projeto

O objetivo principal e oferecer uma solucao acessivel para:

- Monitorar consumo de agua em tempo quase real.
- Visualizar tendencia semanal e historico por periodo.
- Definir limites de consumo.
- Detectar consumo acima do esperado.
- Exibir alertas e notificacoes.
- Facilitar o gerenciamento de perfil e dispositivo.

## 3. Arquitetura da Solucao

O projeto esta organizado como um monorepo:

```txt
eco_flow/
  apps/
    api/      Backend Fastify + Prisma
    mobile/   Aplicativo Expo React Native
  packages/
    shared/   Codigo compartilhado
```

### 3.1 Aplicativo Mobile

Tecnologias principais:

- Expo SDK 54
- React Native
- React Navigation
- Zustand
- React Query
- React Native Gifted Charts
- AsyncStorage

Responsabilidades:

- Exibir dashboard de consumo.
- Consultar dados da API.
- Atualizar informacoes periodicamente.
- Gerenciar estado local do usuario.
- Salvar preferencias como foto de perfil, limite e nome do dispositivo.

### 3.2 Backend/API

Tecnologias principais:

- Node.js
- Fastify
- Prisma ORM
- PostgreSQL/Supabase
- JWT
- Zod

Responsabilidades:

- Autenticacao de usuarios.
- Cadastro de propriedades e hidrometros.
- Ingestao de leituras de consumo.
- Calculo de resumo para dashboard.
- Registro de alertas e notificacoes.
- Persistencia dos dados no banco.

### 3.3 Banco de Dados

Banco previsto: PostgreSQL via Supabase.

Principais tabelas:

- `users`
- `auth_sessions`
- `properties`
- `water_meters`
- `consumption_readings`
- `consumption_limits`
- `alerts`
- `notifications`

## 4. Fluxo de Dados

O fluxo esperado de funcionamento e:

1. O usuario cria uma conta ou faz login.
2. O sistema associa uma propriedade e um hidrometro.
3. Um sensor, simulador ou integracao externa envia leituras de consumo para a API.
4. A API salva a leitura em `consumption_readings`.
5. O backend recalcula indicadores de consumo e alertas.
6. O aplicativo consulta a API periodicamente.
7. A dashboard e os graficos sao atualizados automaticamente.

Endpoint principal para leituras:

```http
POST /api/meters/:meterId/readings
```

Endpoint para simulacao:

```http
POST /api/meters/:meterId/readings/simulate
```

## 5. Funcionalidades Implementadas

### 5.1 Dashboard

A Dashboard apresenta:

- Saudacao personalizada.
- Resumo mensal.
- Gauge de consumo atual.
- Status de consumo: estavel, atencao ou critico.
- Comparacao com periodo anterior.
- Cards de metricas principais.
- Grafico de tendencia semanal.
- Dica inteligente.
- Alertas recentes.
- Popup moderno de notificacoes.

Sugestao de print para slide:

```txt
Inserir print: Dashboard principal
```

### 5.2 Historico

A tela de Historico apresenta:

- Filtros por periodo: Diario, Semanal, Mensal e Anual.
- Grafico de consumo por periodo.
- Total consumido.
- Comparativo com meta.
- Indicadores de pico, minimo, media e tendencia.
- Botao para analise detalhada.

Sugestao de print para slide:

```txt
Inserir print: Historico com grafico de consumo por periodo
```

### 5.3 Alertas e Notificacoes

A tela de alertas apresenta:

- Lista de notificacoes.
- Separacao entre avisos e alertas criticos.
- Indicadores visuais por severidade.
- Mensagens sobre consumo elevado e possivel vazamento.

Sugestao de print para slide:

```txt
Inserir print: Tela de Alertas
```

### 5.4 Limites

A tela de limites permite:

- Ajustar limite mensal de consumo.
- Persistir o valor escolhido.
- Refletir o limite atualizado na tela de Perfil.
- Usar o limite como base para alertas.

Sugestao de print para slide:

```txt
Inserir print: Tela de Limites ou modal de Limites Configurados
```

### 5.5 Perfil

A tela de Perfil permite:

- Visualizar dados do usuario.
- Alterar foto de perfil.
- Refletir a foto tambem na Dashboard.
- Editar dados da conta.
- Alterar nome do dispositivo.
- Consultar limite configurado.
- Acessar privacidade.
- Acessar central de ajuda.

Sugestao de print para slide:

```txt
Inserir print: Perfil com card do usuario
```

## 6. Atualizacao em Tempo Real

O aplicativo foi preparado para atualizacao automatica via polling.

Atualmente, a Dashboard e as notificacoes sao atualizadas em intervalo de 60 segundos usando React Query:

```txt
refetchInterval: 60_000
```

Isso permite apresentar o funcionamento como consumo ao vivo ou quase em tempo real. Para uma evolucao futura, o sistema pode ser adaptado para WebSocket, Server-Sent Events ou Supabase Realtime.

## 7. Simulacao de Consumo

Foi adicionado um script para simular envio continuo de leituras:

```bash
npm run simulate:live --workspace @ecoflow/api
```

Esse script:

- Faz login com usuario demo.
- Localiza o hidrometro associado.
- Gera valores de consumo.
- Envia leituras para a API periodicamente.
- Alimenta a dashboard com dados dinamicos.

## 8. Diferenciais do Projeto

- Interface mobile moderna e focada em usabilidade.
- Dashboard visual com gauge e graficos.
- Sistema de alertas por severidade.
- Perfil com foto persistente.
- Configuracao de limites.
- Estrutura pronta para sensores reais.
- Backend com modelagem relacional robusta.
- Integração planejada com Supabase/PostgreSQL.
- Possibilidade de demonstracao com dados simulados.

## 9. Pontos Tecnicos Relevantes

### 9.1 Estado Local

O app usa Zustand e AsyncStorage para manter:

- Sessao do usuario.
- Foto de perfil.
- Nome do dispositivo.
- Preferencias locais.

### 9.2 Consumo de API

O mobile usa um cliente HTTP centralizado para:

- Adicionar token JWT.
- Padronizar headers.
- Tratar erros.

### 9.3 Validacao

O backend usa Zod para validar:

- Variaveis de ambiente.
- Dados de login/cadastro.
- Leituras de consumo.
- Configuracoes de propriedade e limites.

### 9.4 Banco e ORM

O Prisma e responsavel por:

- Modelagem do banco.
- Migrations.
- Criacao de dados demo.
- Consultas de consumo, alertas e usuarios.

## 10. Como Rodar o Projeto

### API

```bash
npm run dev:api
```

Health check:

```txt
http://localhost:3333/api/health
```

### Mobile

```bash
npm run start --workspace @ecoflow/mobile -- --clear
```

Para celular fisico, o `apiUrl` deve apontar para o IP local do computador:

```json
"apiUrl": "http://SEU_IP_LOCAL:3333/api"
```

## 11. Como Preparar Dados Demo

Depois de configurar Supabase e migrations:

```bash
npm run prisma:migrate --workspace @ecoflow/api -- --name init
npm run prisma:seed --workspace @ecoflow/api
```

Usuario demo:

```txt
Email: demo@ecoflow.app
Senha: senha12345
```

## 12. Evolucoes Futuras

Melhorias sugeridas:

- Integracao com sensores IoT reais.
- Notificacoes push nativas.
- Supabase Realtime para leituras instantaneas.
- Relatorios PDF mensais.
- Cadastro de multiplos dispositivos.
- Compartilhamento familiar da propriedade.
- Previsao de conta de agua com base em tarifa local.
- Detecção mais avancada de anomalias e vazamentos.

## 13. Roteiro Sugerido para Slides

1. Problema: desperdicio e falta de visibilidade sobre consumo de agua.
2. Solucao: EcoFlow como monitor inteligente.
3. Arquitetura: app mobile, API, Supabase e sensores.
4. Dashboard: resumo, gauge, graficos e alertas.
5. Historico: filtros e comparativos.
6. Alertas: avisos e criticidade.
7. Perfil e configuracoes: foto, dispositivo, limites e privacidade.
8. Tempo real: envio via API e atualizacao automatica.
9. Tecnologias utilizadas.
10. Proximos passos.

## 14. Legendas Sugeridas para Prints

Dashboard:

```txt
Tela inicial com resumo mensal, indicador circular de consumo, comparacao com periodo anterior e alertas ativos.
```

Historico:

```txt
Visualizacao do consumo por periodo com filtros e indicadores de pico, minimo, media e tendencia.
```

Alertas:

```txt
Central de notificacoes para avisos de consumo elevado e possiveis vazamentos.
```

Perfil:

```txt
Area do usuario com foto de perfil, dados da conta, dispositivo atual, limites, privacidade e ajuda.
```

