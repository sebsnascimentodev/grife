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
import { readDb, writeDb } from './db.js';
import { gerarHashSenha } from './senha.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/produtos', produtosRouter);
app.use('/api/cupons', cuponsRouter);
app.use('/api/envio', envioRouter);
app.use('/api/pedidos', pedidosRouter);
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

// Semeia o primeiro admin caso ainda não exista nenhum (login: variáveis
// ADMIN_EMAIL / ADMIN_SENHA / ADMIN_CPF do .env — veja server/.env.example).
// Padrão de demonstração: admin@grife.com / grife2024 / CPF 529.982.247-25
async function semearPrimeiroAdmin() {
  const db = await readDb();
  if (db.usuarios.some((u) => u.papel === 'admin')) return;

  const admin = {
    id: randomUUID(),
    nome: 'Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@grife.com').toLowerCase(),
    cpf: (process.env.ADMIN_CPF || '52998224725').replace(/\D/g, ''),
    senhaHash: gerarHashSenha(process.env.ADMIN_SENHA || 'grife2024'),
    papel: 'admin',
    criadoEm: new Date().toISOString(),
  };
  db.usuarios.push(admin);
  await writeDb(db);
  console.log(`Admin inicial criado: ${admin.email}`);
}

semearPrimeiroAdmin()
  .catch((err) => console.error('Erro ao semear admin inicial:', err.message))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`GRIFE. API rodando em http://localhost:${PORT}`);
    });
  });
