import { Router } from 'express';
import { readDb, writeDb } from '../db.js';
import { serializeProduto } from '../helpers.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const db = await readDb();
  res.json(db.produtos.map(serializeProduto));
});

router.get('/:id', async (req, res) => {
  const db = await readDb();
  const produto = db.produtos.find((p) => p.id === req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(serializeProduto(produto));
});

// --- Admin: preços ---
router.put('/:id/preco', requireAdmin, async (req, res) => {
  const { preco } = req.body;
  if (typeof preco !== 'number' || preco < 0) {
    return res.status(400).json({ erro: 'Preço inválido' });
  }
  const db = await readDb();
  const produto = db.produtos.find((p) => p.id === req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  produto.preco = preco;
  await writeDb(db);
  res.json(serializeProduto(produto));
});

// --- Admin: promoção ---
router.put('/:id/promocao', requireAdmin, async (req, res) => {
  const { ativa, tipo, valor, inicio, fim } = req.body;
  const db = await readDb();
  const produto = db.produtos.find((p) => p.id === req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  produto.promocao = {
    ativa: !!ativa,
    tipo: tipo === 'fixo' ? 'fixo' : 'percentual',
    valor: Number(valor) || 0,
    inicio: inicio || null,
    fim: fim || null,
  };
  await writeDb(db);
  res.json(serializeProduto(produto));
});

// --- Admin: estoque por variação ---
router.put('/:id/estoque', requireAdmin, async (req, res) => {
  const { tamanho, estoque } = req.body;
  if (typeof estoque !== 'number' || estoque < 0) {
    return res.status(400).json({ erro: 'Estoque inválido' });
  }
  const db = await readDb();
  const produto = db.produtos.find((p) => p.id === req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  const variacao = produto.variacoes.find((v) => v.tamanho === tamanho);
  if (!variacao) return res.status(404).json({ erro: 'Variação não encontrada' });
  variacao.estoque = estoque;
  await writeDb(db);
  res.json(serializeProduto(produto));
});

export default router;
