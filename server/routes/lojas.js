import { randomUUID } from 'crypto';
import { Router } from 'express';
import { readDb, writeDb } from '../db.js';
import { requireSuperAdmin, requireLojaAdmin, issueToken } from '../auth.js';
import { verificarSenha } from '../senha.js';
import { sanitizar, criarUsuario } from '../contas.js';

const router = Router();

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugValido(slug) {
  return typeof slug === 'string' && SLUG_REGEX.test(slug) && slug.length >= 2 && slug.length <= 40;
}

function envioPadrao() {
  return {
    padrao: { custo: 19.9, prazo: '5 a 8 dias úteis' },
    expresso: { custo: 39.9, prazo: '2 a 4 dias úteis' },
    freteGratisMinimo: 300,
  };
}

// Anexa req.loja a partir de :slug. 404 se a loja não existir.
export async function resolveLoja(req, res, next) {
  const db = await readDb();
  const loja = db.lojas.find((l) => l.slug === req.params.slug);
  if (!loja) return res.status(404).json({ erro: 'Loja não encontrada' });
  req.db = db;
  req.loja = loja;
  next();
}

// Bloqueia acesso público (vitrine/checkout) a lojas suspensas.
export function requireLojaAtiva(req, res, next) {
  if (req.loja.status !== 'ativa') return res.status(404).json({ erro: 'Loja indisponível' });
  next();
}

function serializeLoja(loja, db) {
  const produtos = db.produtos.filter((p) => p.lojaId === loja.id);
  const pedidos = db.pedidos.filter((p) => p.lojaId === loja.id);
  const totalVendido = pedidos
    .filter((p) => p.status !== 'Cancelado')
    .reduce((soma, p) => soma + p.total, 0);
  return {
    ...loja,
    metricas: {
      produtos: produtos.length,
      pedidos: pedidos.length,
      totalVendido: Math.round(totalVendido * 100) / 100,
    },
  };
}

router.get('/', requireSuperAdmin, async (req, res) => {
  const db = await readDb();
  res.json(db.lojas.map((loja) => serializeLoja(loja, db)));
});

router.post('/', requireSuperAdmin, async (req, res) => {
  const { nome, slug, plano, admin } = req.body;
  if (!nome || !slugValido(slug)) {
    return res.status(400).json({ erro: 'Nome e slug (letras minúsculas/números/hífen) são obrigatórios' });
  }
  const db = await readDb();
  if (db.lojas.some((l) => l.slug === slug)) {
    return res.status(409).json({ erro: 'Já existe uma loja com esse slug' });
  }

  const agora = new Date().toISOString();
  const loja = {
    id: randomUUID(),
    slug,
    nome,
    status: 'ativa',
    plano: {
      tipo: 'fixo',
      valor: Number(plano?.valor) || 0,
      cicloDias: Number(plano?.cicloDias) || 30,
      ativoDesde: agora,
    },
    envio: envioPadrao(),
    proximoNumeroPedido: 1,
    criadoEm: agora,
  };

  try {
    const usuarioAdmin = await criarUsuario({ ...admin, papel: 'admin', lojaId: loja.id }, db);
    db.lojas.push(loja);
    await writeDb(db);
    res.status(201).json({ loja: serializeLoja(loja, db), admin: sanitizar(usuarioAdmin) });
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.erro || 'Erro ao criar loja' });
  }
});

router.put('/:id', requireSuperAdmin, async (req, res) => {
  const { nome, status, plano } = req.body;
  const db = await readDb();
  const loja = db.lojas.find((l) => l.id === req.params.id);
  if (!loja) return res.status(404).json({ erro: 'Loja não encontrada' });

  if (nome !== undefined) loja.nome = nome;
  if (status !== undefined) {
    if (!['ativa', 'suspensa'].includes(status)) return res.status(400).json({ erro: 'Status inválido' });
    loja.status = status;
  }
  if (plano !== undefined) {
    loja.plano = {
      ...loja.plano,
      ...(plano.valor !== undefined && { valor: Number(plano.valor) }),
      ...(plano.cicloDias !== undefined && { cicloDias: Number(plano.cicloDias) }),
    };
  }
  await writeDb(db);
  res.json(serializeLoja(loja, db));
});

router.get('/:slug/info', resolveLoja, requireLojaAtiva, async (req, res) => {
  res.json({ id: req.loja.id, slug: req.loja.slug, nome: req.loja.nome, status: req.loja.status });
});

// Login escopado à loja — rejeita contas que não administram esta loja específica
// (super admin tem bypass).
router.post('/:slug/login', resolveLoja, async (req, res) => {
  const { email, senha } = req.body;
  const usuario = req.db.usuarios.find((u) => u.email === String(email || '').trim().toLowerCase());
  if (!usuario || !verificarSenha(senha || '', usuario.senhaHash)) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
  }
  const autorizado = usuario.papel === 'superadmin' || (usuario.papel === 'admin' && usuario.lojaId === req.loja.id);
  if (!autorizado) {
    return res.status(403).json({ erro: 'Esta conta não administra esta loja' });
  }
  res.json({ token: issueToken(usuario), usuario: sanitizar(usuario) });
});

router.get('/:slug/admins', resolveLoja, requireLojaAdmin, async (req, res) => {
  const admins = req.db.usuarios.filter((u) => u.papel === 'admin' && u.lojaId === req.loja.id);
  res.json(admins.map(sanitizar));
});

router.post('/:slug/admins', resolveLoja, requireLojaAdmin, async (req, res) => {
  try {
    const usuario = await criarUsuario({ ...req.body, papel: 'admin', lojaId: req.loja.id }, req.db);
    await writeDb(req.db);
    res.status(201).json(sanitizar(usuario));
  } catch (e) {
    res.status(e.status || 500).json({ erro: e.erro || 'Erro ao criar administrador' });
  }
});

export default router;
