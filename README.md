# 💸 HenriqueLima.pro - Payment & Donation Service

Microsserviço Serverless responsável pelo processamento de pagamentos, doações e gestão financeira do ecossistema **HenriqueLima.pro**.

Construído com **Clean Architecture**, focado em alta disponibilidade, idempotência e suporte a múltiplos provedores de pagamento (Fiat e Crypto).

---

## 🚀 Tecnologias e Stack

- **Runtime:** Node.js 20+ (AWS Lambda)
- **Framework:** [Fastify](https://www.fastify.io/) (via `@fastify/aws-lambda`)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (Serverless via [Neon](https://neon.tech/))
- **ORM:** Prisma ORM (com `@prisma/adapter-neon`)
- **Infraestrutura (IaC):** [SST](https://sst.dev/) (Serverless Stack)
- **Filas/Async:** AWS SQS
- **Validação:** Zod

---

## 🏛️ Arquitetura

O projeto segue os princípios de **Clean Architecture** e **SOLID**, desacoplando a regra de negócio de frameworks externos.

---

### Estrutura de Pastas

```text
src/
├── app.ts                 # Configuração principal do Fastify (Lambda Monolith)
├── controllers/           # Interface Adapters (Entrada HTTP)
│   ├── donation/          # Webhooks (Stripe, OpenNode)
│   └── payment/           # Endpoints do ERP Interno (Manual)
├── use-cases/              # Regras de Negócio (Application Business Rules)
├── services/              # Serviços de Domínio (Conversão, Taxas)
│   └── strategies/        # Strategy Pattern para validação e cálculo de taxas
├── repositories/          # Acesso a Dados (Prisma Implementation)
├── functions/             # Lambdas Workers (Consumidores SQS)
├── queues/                # Produtores de Mensagem (SQS)
├── middlewares/           # Validação de Assinatura (Webhook Security)
├── schemas/               # Definições Zod (DTOs e Payloads)
├── mappers/               # Tradução de Estados (Provider -> Domain)
├── lib/                   # Configurações de Infra (Prisma Client, etc)
└── env/                   # Validação de Variáveis de Ambiente
```

---

### ⚡ Funcionalidades Chave

1. Gateway de Doações (Webhooks)
   Recebe notificações de pagamento em tempo real, valida a autenticidade e processa assincronamente.

Stripe: Cartão de Crédito e PIX.

OpenNode: Bitcoin (On-chain e Lightning Network).

2. Idempotência e Resiliência
   Utiliza Upsert no banco de dados para garantir que eventos duplicados enviados pelos gateways não dupliquem registros financeiros.

Processamento via AWS SQS para garantir que falhas em APIs externas (como cotação de moeda) não percam o pagamento (Retry Pattern).

3. Normalização Financeira
   Multi-Currency: Recebe em BRL, USD, EUR ou BTC.

Normalização: Converte automaticamente todos os valores para BRL no momento do recebimento para fins de dashboard e tributação.

Estratégia de Taxas: Calcula taxas (Fees) e valor líquido (netAmount) dinamicamente dependendo do provedor.

4. Mini ERP (Gestão de Freelance)
   Módulo para registro manual de projetos e recebimentos externos, permitindo uma visão unificada de todo o fluxo de caixa pessoal/profissional.

---

### 🛠️ Configuração e Instalação

Pré-requisitos
Node.js 18+

Conta na AWS (configurada no AWS CLI)

Conta no Neon (Postgres)

1. Instalação

```Bash

npm install
```

2. Variáveis de Ambiente
   Crie um arquivo .env na raiz baseado no exemplo:

```Ini, TOML

# Banco de Dados
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Stripe
STRIPE_API_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenNode
OPEN_NODE_API_KEY="..."

# Infraestrutura (Injetado automaticamente pelo SST em prod)
DonationQueueUrl="[https://sqs.us-east-1.amazonaws.com/](https://sqs.us-east-1.amazonaws.com/)..."
```

3. Rodando Localmente (Live Lambda Dev)
   O SST permite rodar a infraestrutura localmente conectada à AWS real.

```Bash

npx sst dev
```

Isso iniciará o servidor Fastify e o Worker SQS em modo de desenvolvimento.

4. Deploy
   Para subir para produção (AWS Lambda):

```Bash

npx sst deploy --stage production
```

---

### 🔒 Segurança

Webhook Signature: Todos os endpoints de doação (/webhook/\*) implementam validação criptográfica (HMAC SHA256) para garantir que a requisição veio realmente do Stripe ou OpenNode.

Zod Validation: Nenhum dado entra no UseCase sem passar por validação estrita de tipos.

Environment: O servidor falha no boot se alguma variável crítica estiver faltando.

---

### 🧪 Padrões de Projeto Utilizados

Strategy Pattern: Utilizado para validar assinaturas de webhooks diferentes e calcular taxas específicas por provedor.

Repository Pattern: Abstração da camada de banco de dados.

Factory Pattern: Injeção de dependências nos Use Cases.

Adapter Pattern: Adaptação dos eventos AWS/Http para o formato do Fastify.

---

Desenvolvido por Henrique Lima
