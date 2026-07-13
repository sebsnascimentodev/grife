import { randomUUID } from 'crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { readDb, writeDb } from '../db.js';
import { requireAuth, requireAdmin, issueToken } from '../auth.js';
import { cpfValido, limparCpf } from '../cpf.js';
import { gerarHashSenha, verificarSenha } from '../senha.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});

function sanitizar(usuario) {
  const { senhaHash, ...resto } = usuario;
  return resto;
}

async function criarUsuario({ nome, email, cpf, senha, papel }, db) {
  const emailNormalizado = String(email || '').trim().toLowerCase();
  const cpfLimpo = limparCpf(cpf);

  if (!nome || !emailNormalizado || !senha) {
    throw { status: 400, erro: 'Nome, e-mail e senha são obrigatórios' };
  }
  if (senha.length < 6) {
    throw { status: 400, erro: 'A senha precisa ter pelo menos 6 caracteres' };
  }
  if (!cpfValido(cpfLimpo)) {
    throw { status: 400, erro: 'CPF inválido' };
  }
  if (db.usuarios.some((u) => u.email === emailNormalizado)) {
    throw { status: 409, erro: 'Já existe uma conta com este e-mail' };
  }
  if (db.usuarios.some((u) => u.cpf === cpfLimpo)) {
    throw { status: 409, erro: 'Este CPF já está associado a uma conta' };
  }

  const usuario = {
    id: randomUUID(),
    nome,
    email: emailNormalizado,
    cpf: cpfLimpo,
    senhaHash: gerarHashSenha(senha),
    papel,
    criadoEm: new Date().toISOString(),
  };
  db.usuarios.push(usuario);
  return usuario;
}

router.post('/registrar', loginLimiter, async (req, res) => {
  const db = await readDb();
  try {
    const usuario = await criarUsuario({ ...req.body, papel: 'cliente' }, db);
    await writeDb(db);
    res.status(201).json({ token: issueToken(usuario), usuario: sanitizar(usuario) });
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.erro || 'Erro ao criar conta' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, senha } = req.body;
  const db = await readDb();
  const usuario = db.usuarios.find((u) => u.email === String(email || '').trim().toLowerCase());
  if (!usuario || !verificarSenha(senha || '', usuario.senhaHash)) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
  }
  res.json({ token: issueToken(usuario), usuario: sanitizar(usuario) });
});

router.get('/me', requireAuth, async (req, res) => {
  const db = await readDb();
  const usuario = db.usuarios.find((u) => u.id === req.usuario.id);
  if (!usuario) return res.status(404).json({ erro: 'Conta não encontrada' });
  res.json(sanitizar(usuario));
});

// --- Admin: gestão de administradores ---
router.get('/admins', requireAdmin, async (req, res) => {
  const db = await readDb();
  res.json(db.usuarios.filter((u) => u.papel === 'admin').map(sanitizar));
});

router.post('/admins', requireAdmin, async (req, res) => {
  const db = await readDb();
  try {
    const usuario = await criarUsuario({ ...req.body, papel: 'admin' }, db);
    await writeDb(db);
    res.status(201).json(sanitizar(usuario));
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.erro || 'Erro ao criar administrador' });
  }
});

export default router;
