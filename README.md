# GRIFE.

Loja de streetwear/grife (Nike, Adidas, Lacoste, Hugo Boss, Polo, Saint Laurent) construída como uma aplicação full-stack: **React** no front, **Node.js/Express** no back, **Redis** como banco de dados e **Mercado Pago (Checkout Bricks)** processando pagamentos de verdade em modo sandbox.

Não é só uma vitrine estática — tem estoque por variação (tamanho/numeração), promoções com tag automática, cupons com regras de uso, cálculo de frete grátis, checkout com pagamento real (cartão/Pix/boleto via Mercado Pago) e um painel administrativo completo escondido atrás de uma rota não-óbvia, com autenticação por token.

## Stack

| Camada       | Tecnologia                                                |
| ------------ | ---------------------------------------------------------- |
| Frontend     | React 19 + Vite + React Router                              |
| Backend      | Node.js + Express                                          |
| Banco de dados | Redis                                                     |
| Pagamentos   | Mercado Pago — Payment Brick (SDK v2)                       |
| Auth admin   | Token assinado (HMAC), com rate limit no login              |

## Funcionalidades

### Loja (pública)

- Home com grid de produtos e filtro por categoria (Masculino, Feminino, Calçados, Acessórios)
- Página de produto com seletor de tamanho obrigatório (erro visual se não selecionar), produtos relacionados
- Carrinho: quantidade editável, mensagem dinâmica de frete grátis, aplicação de cupom
- Checkout: dados do cliente, endereço, escolha de frete (padrão/expresso) e **pagamento real via Mercado Pago** (cartão de crédito/débito, Pix, boleto — em modo sandbox)
- Confirmação com número de pedido no formato `#GR000000`

### Estoque e regras de negócio

- Estoque controlado por variação (tamanho/numeração), não por produto
- Estoque decrementado automaticamente ao finalizar a compra
- Variação com estoque zerado aparece como "Esgotado" e não pode ser comprada
- Alerta de estoque baixo (≤ 3 unidades) visível só no admin

### Painel admin (rota oculta)

Não há nenhum link para o admin em nenhum lugar do site público. A rota é:

```
/gerenciar-x9k2
```

Login fixo (apenas para demonstração — veja `server/routes/admin.js`):

```
usuário: admin
senha:   grife2024
```

Abas do dashboard:

- **Estoque** — editar quantidade por variação, com indicador de estoque baixo/esgotado
- **Preços** — editar preço base de cada produto
- **Promoções** — ativar/desativar por produto, % ou R$ fixo, data de início/fim, tag "PROMOÇÃO" automática
- **Cupons** — criar/editar/excluir, % ou R$ fixo, valor mínimo, validade, limite de uso, uso único por cliente
- **Saldo/Financeiro** — total vendido, taxa simulada, saldo disponível, lista de pedidos com status editável
- **Envio** — editar custo/prazo do frete padrão e expresso, e o valor mínimo para frete grátis

Toda alteração no admin reflete imediatamente na loja (mesmo banco de dados via API).

## Segurança

- Todas as rotas de escrita do admin (estoque, preços, promoções, cupons, envio, listagem/status de pedidos) exigem um token Bearer válido, emitido no login e verificado por assinatura HMAC no backend — não dá para chamar a API diretamente sem autenticar.
- Rate limit no endpoint de login (10 tentativas / 15 min por IP).
- O Access Token do Mercado Pago fica só no backend (`server/.env`); o client só recebe a Public Key.

## Estrutura do projeto

```
grife/
├── server/              # API Express
│   ├── routes/          # produtos, cupons, envio, pedidos, admin, pagamento
│   ├── data/db.json      # seed inicial (carregado no Redis no primeiro boot)
│   ├── db.js             # camada de acesso ao Redis
│   ├── auth.js           # emissão/verificação do token admin
│   └── mercadopago.js     # client do SDK Mercado Pago
└── client/              # SPA React (Vite)
    └── src/
        ├── pages/         # loja pública
        ├── pages/admin/   # painel administrativo
        ├── context/       # carrinho, catálogo, auth admin
        └── components/    # Header, ProductCard, PaymentBrick
```

## Como rodar localmente

Pré-requisitos: Node.js 20+ e uma instância Redis acessível (local, Docker ou Railway).

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # preencha REDIS_URL, ADMIN_TOKEN_SECRET, MP_ACCESS_TOKEN e MP_PUBLIC_KEY
npm run dev
```

API sobe em `http://localhost:4000`.

### 2. Frontend

Em outro terminal:

```bash
cd client
npm install
npm run dev
```

App sobe em `http://localhost:5173` (o Vite já faz proxy de `/api` para o backend).

### Credenciais do Mercado Pago

Use as credenciais de **teste** da sua conta Mercado Pago (Public Key + Access Token do modo sandbox) e os [cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/additional-content/your-integrations/test-cards) para simular aprovação, recusa ou pendência de pagamento.

### Build de produção

```bash
cd client && npm run build
cd ../server && npm start
```

O Express já serve o build do client (`client/dist`) e a API a partir da mesma porta.

## Limitações conhecidas

- Login do admin usa credenciais fixas — serve para demonstrar a restrição de acesso, não é um sistema de usuários real.
- Pagamento roda em modo **sandbox** do Mercado Pago — trocar as credenciais de `.env` para produção quando for usar de verdade.
- CEP é digitado manualmente (sem consulta automática de endereço).
