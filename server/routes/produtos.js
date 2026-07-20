import { Router } from 'express';
import { writeDb } from '../db.js';
import { serializeProduto } from '../helpers.js';
import { requireLojaAdmin } from '../auth.js';
import { requireLojaAtiva } from './lojas.js';

const router = Router();

router.get('/', requireLojaAtiva, async (req, res) => {
  const produtos = req.db.produtos.filter((p) => p.lojaId === req.loja.id);
  res.json(produtos.map(serializeProduto));
});

router.get('/:id', requireLojaAtiva, async (req, res) => {
  const produto = req.db.produtos.find((p) => p.id === req.params.id && p.lojaId === req.loja.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(serializeProduto(produto));
});

// --- Admin: preços ---
router.put('/:id/preco', requireLojaAdmin, async (req, res) => {
  const { preco } = req.body;
  if (typeof preco !== 'number' || preco < 0) {
    return res.status(400).json({ erro: 'Preço inválido' });
  }
  const produto = req.db.produtos.find((p) => p.id === req.params.id && p.lojaId === req.loja.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  produto.preco = preco;
  await writeDb(req.db);
  res.json(serializeProduto(produto));
});

// --- Admin: promoção ---
router.put('/:id/promocao', requireLojaAdmin, async (req, res) => {
  const { ativa, tipo, valor, inicio, fim } = req.body;
  const produto = req.db.produtos.find((p) => p.id === req.params.id && p.lojaId === req.loja.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  produto.promocao = {
    ativa: !!ativa,
    tipo: tipo === 'fixo' ? 'fixo' : 'percentual',
    valor: Number(valor) || 0,
    inicio: inicio || null,
    fim: fim || null,
  };
  await writeDb(req.db);
  res.json(serializeProduto(produto));
});

// --- Admin: estoque por variação ---
router.put('/:id/estoque', requireLojaAdmin, async (req, res) => {
  const { tamanho, estoque } = req.body;
  if (typeof estoque !== 'number' || estoque < 0) {
    return res.status(400).json({ erro: 'Estoque inválido' });
  }
  const produto = req.db.produtos.find((p) => p.id === req.params.id && p.lojaId === req.loja.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  const variacao = produto.variacoes.find((v) => v.tamanho === tamanho);
  if (!variacao) return res.status(404).json({ erro: 'Variação não encontrada' });
  variacao.estoque = estoque;
  await writeDb(req.db);
  res.json(serializeProduto(produto));
});

export default router;
