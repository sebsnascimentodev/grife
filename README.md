# GRIFE.

Loja de streetwear/grife (Nike, Adidas, Lacoste, Hugo Boss, Polo, Saint Laurent) construída como uma aplicação full-stack: **React** no front, **Node.js/Express** no back, **Redis** como banco de dados e **Mercado Pago (Checkout Bricks)** processando pagamentos de verdade em modo sandbox.

Não é só uma vitrine estática — tem estoque por variação (tamanho/numeração), promoções com tag automática, cupons com regras de uso, cálculo de frete grátis, checkout com pagamento real (cartão/Pix/boleto via Mercado Pago), contas de usuário com CPF único, e um painel administrativo completo escondido atrás de uma rota não-óbvia.

## Stack

| Camada       | Tecnologia                                                |
| ------------ | ---------------------------------------------------------- |
| Frontend     | React 19 + Vite + React Router                              |
| Backend      | Node.js + Express                                          |
| Banco de dados | Redis                                                     |
| Pagamentos   | Mercado Pago — Payment Brick (SDK v2)                       |
| Autenticação | Contas (cliente/admin) com senha com hash (scrypt) e token assinado (HMAC), rate limit no login |

## Funcionalidades

### Loja (pública)

- Home com grid de produtos e filtro por categoria (Masculino, Feminino, Calçados, Acessórios)
- Página de produto com seletor de tamanho obrigatório (erro visual se não selecionar), produtos relacionados
- Carrinho: quantidade editável, mensagem dinâmica de frete grátis, aplicação de cupom — **tudo livre, sem precisar de conta**
- Checkout: dados do cliente, endereço (com autocompletar por CEP via ViaCEP), escolha de frete (padrão/expresso) e **pagamento real via Mercado Pago** (cartão de crédito/débito, Pix, boleto — em modo sandbox) — **exige login/conta** para finalizar
- Confirmação com número de pedido no formato `#GR000000`

### Contas de usuário

- Navegar, montar a sacola e testar cupom não exigem conta — só finalizar a compra no checkout pede login.
- Cadastro pede nome, e-mail, CPF e senha. **Um CPF só pode estar associado a uma conta** (validação de checksum real + unicidade no backend), regra que vale tanto para contas de cliente quanto de admin.
- Clientes e admins vivem na mesma tabela de usuários, diferenciados por `papel` (`cliente` ou `admin`).

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

O login do admin usa o mesmo sistema de contas da loja. Um primeiro admin é **semeado automaticamente** no primeiro boot do backend, a partir das variáveis `ADMIN_EMAIL` / `ADMIN_SENHA` / `ADMIN_CPF` do `.env` (veja `server/index.js`). Padrão de demonstração:

```
e-mail: admin@grife.com
senha:  grife2024
```

A partir daí, novos admins **só podem ser criados por um admin já logado**, na própria aba "Admins" do painel (não existe cadastro público de admin).

Abas do dashboard:

- **Estoque** — editar quantidade por variação, com indicador de estoque baixo/esgotado
- **Preços** — editar preço base de cada produto
- **Promoções** — ativar/desativar por produto, % ou R$ fixo, data de início/fim, tag "PROMOÇÃO" automática
- **Cupons** — criar/editar/excluir, % ou R$ fixo, valor mínimo, validade, limite de uso, uso único por cliente
- **Saldo/Financeiro** — total vendido, taxa simulada, saldo disponível, lista de pedidos com status editável
- **Envio** — editar custo/prazo do frete padrão e expresso, e o valor mínimo para frete grátis
- **Admins** — listar administradores e criar novos (CPF único, assim como as contas de cliente)

Toda alteração no admin reflete imediatamente na loja (mesmo banco de dados via API).

## Segurança

- Senhas nunca são armazenadas em texto puro — hash com `scrypt` (salt aleatório por usuário).
- Todas as rotas de escrita do admin (estoque, preços, promoções, cupons, envio, listagem/status de pedidos, gestão de admins) exigem um token Bearer válido, emitido no login e verificado por assinatura HMAC no backend — não dá para chamar a API diretamente sem autenticar.
- CPF é validado por checksum real (não só formato) e é único por conta — cruzando clientes e admins na mesma verificação.
- Rate limit nos endpoints de login/registro (15 tentativas / 15 min por IP).
- O Access Token do Mercado Pago fica só no backend (`server/.env`); o client só recebe a Public Key.

## Estrutura do projeto

```
grife/
├── server/              # API Express
│   ├── routes/          # produtos, cupons, envio, pedidos, usuarios, pagamento
│   ├── data/db.json      # seed inicial (carregado no Redis no primeiro boot)
│   ├── db.js             # camada de acesso ao Redis
│   ├── auth.js           # emissão/verificação do token de sessão
│   ├── senha.js          # hash/verificação de senha (scrypt)
│   ├── cpf.js            # validação de CPF (checksum)
│   └── mercadopago.js     # client do SDK Mercado Pago
└── client/              # SPA React (Vite)
    └── src/
        ├── pages/         # loja pública + página de conta (/conta)
        ├── pages/admin/   # painel administrativo
        ├── context/       # carrinho, catálogo, autenticação
        └── components/    # Header, ProductCard, PaymentBrick, AuthForms
```

## Como rodar localmente

Pré-requisitos: Node.js 20+ e uma instância Redis acessível (local, Docker ou Railway).

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # preencha REDIS_URL, ADMIN_TOKEN_SECRET, MP_ACCESS_TOKEN, MP_PUBLIC_KEY e o admin inicial (ADMIN_EMAIL/ADMIN_SENHA/ADMIN_CPF)
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

- Pagamento roda em modo **sandbox** do Mercado Pago — trocar as credenciais de `.env` para produção quando for usar de verdade.
- Não há recuperação de senha nem verificação de e-mail — foco é demonstrar a regra de negócio (CPF único), não um sistema de contas de produção completo.
