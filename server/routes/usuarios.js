import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { readDb, writeDb } from '../db.js';
import { requireAuth, requireSuperAdmin, issueToken } from '../auth.js';
import { verificarSenha } from '../senha.js';
import { sanitizar, criarUsuario } from '../contas.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});

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

// --- Super admin: gestão de contas da plataforma (não confundir com admins de loja,
// que são criados em POST /api/lojas/:slug/admins) ---
router.get('/admins', requireSuperAdmin, async (req, res) => {
  const db = await readDb();
  res.json(db.usuarios.filter((u) => u.papel === 'superadmin').map(sanitizar));
});

router.post('/admins', requireSuperAdmin, async (req, res) => {
  const db = await readDb();
  try {
    const usuario = await criarUsuario({ ...req.body, papel: 'superadmin' }, db);
    await writeDb(db);
    res.status(201).json(sanitizar(usuario));
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.erro || 'Erro ao criar administrador' });
  }
});

export default router;
