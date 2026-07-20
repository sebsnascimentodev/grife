import { Router } from 'express';
import { writeDb } from '../db.js';
import { cupomStatus } from '../helpers.js';
import { requireLojaAdmin } from '../auth.js';
import { requireLojaAtiva } from './lojas.js';

const router = Router();

router.get('/', requireLojaAdmin, async (req, res) => {
  const cupons = req.db.cupons.filter((c) => c.lojaId === req.loja.id);
  res.json(cupons.map((c) => ({ ...c, status: cupomStatus(c) })));
});

// Valida cupom para uso no carrinho (não incrementa uso ainda)
router.post('/validar', requireLojaAtiva, async (req, res) => {
  const { codigo, subtotal } = req.body;
  const cupom = req.db.cupons.find(
    (c) => c.lojaId === req.loja.id && c.codigo.toLowerCase() === String(codigo || '').toLowerCase()
  );
  if (!cupom) return res.status(404).json({ erro: 'Cupom não encontrado' });
  const status = cupomStatus(cupom);
  if (status !== 'ativo') return res.status(400).json({ erro: `Cupom ${status}` });
  if (subtotal < cupom.valorMinimo) {
    return res.status(400).json({ erro: `Valor mínimo de compra é R$ ${cupom.valorMinimo.toFixed(2)}` });
  }
  res.json({ ...cupom, status });
});

router.post('/', requireLojaAdmin, async (req, res) => {
  const { codigo, tipo, valor, valorMinimo, validade, limiteUso, usoUnicoPorCliente } = req.body;
  if (!codigo || !validade || !limiteUso) return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  if (req.db.cupons.some((c) => c.lojaId === req.loja.id && c.codigo.toLowerCase() === codigo.toLowerCase())) {
    return res.status(409).json({ erro: 'Já existe um cupom com esse código' });
  }
  const novo = {
    lojaId: req.loja.id,
    codigo: codigo.toUpperCase(),
    tipo: tipo === 'fixo' ? 'fixo' : 'percentual',
    valor: Number(valor) || 0,
    valorMinimo: Number(valorMinimo) || 0,
    validade,
    limiteUso: Number(limiteUso),
    usosAtuais: 0,
    usoUnicoPorCliente: !!usoUnicoPorCliente,
    ativo: true,
  };
  req.db.cupons.push(novo);
  await writeDb(req.db);
  res.status(201).json({ ...novo, status: cupomStatus(novo) });
});

router.put('/:codigo', requireLojaAdmin, async (req, res) => {
  const cupom = req.db.cupons.find((c) => c.codigo === req.params.codigo && c.lojaId === req.loja.id);
  if (!cupom) return res.status(404).json({ erro: 'Cupom não encontrado' });
  const { tipo, valor, valorMinimo, validade, limiteUso, usoUnicoPorCliente, ativo } = req.body;
  if (tipo !== undefined) cupom.tipo = tipo === 'fixo' ? 'fixo' : 'percentual';
  if (valor !== undefined) cupom.valor = Number(valor);
  if (valorMinimo !== undefined) cupom.valorMinimo = Number(valorMinimo);
  if (validade !== undefined) cupom.validade = validade;
  if (limiteUso !== undefined) cupom.limiteUso = Number(limiteUso);
  if (usoUnicoPorCliente !== undefined) cupom.usoUnicoPorCliente = !!usoUnicoPorCliente;
  if (ativo !== undefined) cupom.ativo = !!ativo;
  await writeDb(req.db);
  res.json({ ...cupom, status: cupomStatus(cupom) });
});

router.delete('/:codigo', requireLojaAdmin, async (req, res) => {
  const idx = req.db.cupons.findIndex((c) => c.codigo === req.params.codigo && c.lojaId === req.loja.id);
  if (idx === -1) return res.status(404).json({ erro: 'Cupom não encontrado' });
  req.db.cupons.splice(idx, 1);
  await writeDb(req.db);
  res.status(204).end();
});

export default router;
