import { randomUUID } from 'crypto';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import produtosRouter from './routes/produtos.js';
import cuponsRouter from './routes/cupons.js';
import envioRouter from './routes/envio.js';
import pedidosRouter from './routes/pedidos.js';
import usuariosRouter from './routes/usuarios.js';
import pagamentoRouter from './routes/pagamento.js';
import lojasRouter, { resolveLoja } from './routes/lojas.js';
import { readDb, writeDb } from './db.js';
import { gerarHashSenha } from './senha.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

// Rotas escopadas por loja (:slug resolvido por resolveLoja e anexado em req.loja/req.db)
app.use('/api/lojas/:slug/produtos', resolveLoja, produtosRouter);
app.use('/api/lojas/:slug/cupons', resolveLoja, cuponsRouter);
app.use('/api/lojas/:slug/envio', resolveLoja, envioRouter);
app.use('/api/lojas/:slug/pedidos', resolveLoja, pedidosRouter);

// Gestão de lojas (super admin) + rotas públicas/login escopados por slug
app.use('/api/lojas', lojasRouter);

app.use('/api/usuarios', usuariosRouter);
app.use('/api/pagamento', pagamentoRouter);

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

// Migração única: introduz o conceito de "loja" (multi-tenant). Bancos criados
// antes disso guardavam produtos/cupons/pedidos/envio no nível global — aqui
// tudo isso é movido para a primeira loja ("grife"), e qualquer usuário que já
// era 'admin' vira 'superadmin' (dono da plataforma), já que antes só existia
// esse papel único. Idempotente: só roda se db.lojas ainda não existir.
async function migrarParaMultiTenant() {
  const db = await readDb();
  if (db.lojas) return;

  const agora = new Date().toISOString();
  const loja = {
    id: randomUUID(),
    slug: 'grife',
    nome: 'Grife',
    status: 'ativa',
    plano: { tipo: 'fixo', valor: 0, cicloDias: 30, ativoDesde: agora },
    envio: db.envio,
    proximoNumeroPedido: db.proximoNumeroPedido,
    criadoEm: agora,
  };

  for (const produto of db.produtos) produto.lojaId = loja.id;
  for (const cupom of db.cupons) cupom.lojaId = loja.id;
  for (const pedido of db.pedidos) pedido.lojaId = loja.id;
  for (const usuario of db.usuarios) {
    if (usuario.papel === 'admin') {
      usuario.papel = 'superadmin';
      usuario.lojaId = null;
    } else if (usuario.papel === 'cliente') {
      usuario.lojaId = null;
    }
  }

  db.lojas = [loja];
  delete db.envio;
  delete db.proximoNumeroPedido;

  await writeDb(db);
  console.log(`Migração multi-tenant concluída: loja "${loja.slug}" criada.`);
}

// Semeia o primeiro super admin caso ainda não exista nenhum (login: variáveis
// ADMIN_EMAIL / ADMIN_SENHA / ADMIN_CPF do .env — veja server/.env.example).
// Padrão de demonstração: admin@grife.com / grife2024 / CPF 529.982.247-25
async function semearPrimeiroAdmin() {
  const db = await readDb();
  if (db.usuarios.some((u) => u.papel === 'superadmin')) return;

  const admin = {
    id: randomUUID(),
    nome: 'Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@grife.com').toLowerCase(),
    cpf: (process.env.ADMIN_CPF || '52998224725').replace(/\D/g, ''),
    senhaHash: gerarHashSenha(process.env.ADMIN_SENHA || 'grife2024'),
    papel: 'superadmin',
    lojaId: null,
    criadoEm: new Date().toISOString(),
  };
  db.usuarios.push(admin);
  await writeDb(db);
  console.log(`Super admin inicial criado: ${admin.email}`);
}

migrarParaMultiTenant()
  .then(semearPrimeiroAdmin)
  .catch((err) => console.error('Erro ao inicializar banco:', err.message))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`GRIFE. API rodando em http://localhost:${PORT}`);
    });
  });
