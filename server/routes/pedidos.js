import { Router } from 'express';
import { readDb, writeDb } from '../db.js';
import { precoEfetivo, formatarNumeroPedido, calcularDescontoCupom, cupomStatus } from '../helpers.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/', requireAdmin, async (req, res) => {
  const db = await readDb();
  res.json(db.pedidos);
});

router.post('/', async (req, res) => {
  const { cliente, endereco, itens, metodoEnvio, cupomCodigo, pagamento } = req.body;

  if (!cliente?.nome || !cliente?.email || !cliente?.telefone) {
    return res.status(400).json({ erro: 'Dados do cliente incompletos' });
  }
  if (!endereco?.cep || !endereco?.rua || !endereco?.numero || !endereco?.cidade || !endereco?.uf) {
    return res.status(400).json({ erro: 'Endereço incompleto' });
  }
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Sacola vazia' });
  }
  if (!['padrao', 'expresso'].includes(metodoEnvio)) {
    return res.status(400).json({ erro: 'Método de envio inválido' });
  }
  if (!pagamento?.metodo) {
    return res.status(400).json({ erro: 'Método de pagamento não informado' });
  }

  const db = await readDb();

  const itensProcessados = [];
  for (const item of itens) {
    const produto = db.produtos.find((p) => p.id === item.produtoId);
    if (!produto) return res.status(404).json({ erro: `Produto ${item.produtoId} não encontrado` });
    const variacao = produto.variacoes.find((v) => v.tamanho === item.tamanho);
    if (!variacao) return res.status(404).json({ erro: `Tamanho ${item.tamanho} indisponível para ${produto.nome}` });
    if (variacao.estoque < item.quantidade) {
      return res.status(409).json({ erro: `Estoque insuficiente para ${produto.nome} (${item.tamanho})` });
    }
    itensProcessados.push({
      produtoId: produto.id,
      marca: produto.marca,
      nome: produto.nome,
      tamanho: item.tamanho,
      quantidade: item.quantidade,
      precoUnitario: precoEfetivo(produto),
    });
  }

  const subtotal = Math.round(
    itensProcessados.reduce((soma, i) => soma + i.precoUnitario * i.quantidade, 0) * 100
  ) / 100;

  let cupomAplicado = null;
  let desconto = 0;
  if (cupomCodigo) {
    const cupom = db.cupons.find((c) => c.codigo.toLowerCase() === String(cupomCodigo).toLowerCase());
    if (!cupom) return res.status(404).json({ erro: 'Cupom não encontrado' });
    if (cupomStatus(cupom) !== 'ativo') return res.status(400).json({ erro: `Cupom ${cupomStatus(cupom)}` });
    if (subtotal < cupom.valorMinimo) {
      return res.status(400).json({ erro: `Valor mínimo de compra para o cupom é R$ ${cupom.valorMinimo.toFixed(2)}` });
    }
    if (cupom.usoUnicoPorCliente) {
      const jaUsou = db.pedidos.some(
        (p) => p.cupom?.codigo === cupom.codigo && p.cliente.email.toLowerCase() === cliente.email.toLowerCase()
      );
      if (jaUsou) return res.status(400).json({ erro: 'Este cupom já foi utilizado por este cliente' });
    }
    desconto = calcularDescontoCupom(cupom, subtotal);
    cupomAplicado = { codigo: cupom.codigo, tipo: cupom.tipo, valor: cupom.valor };
    cupom.usosAtuais += 1;
  }

  const freteGratis = metodoEnvio === 'padrao' && subtotal >= db.envio.freteGratisMinimo;
  const custoEnvio = freteGratis ? 0 : db.envio[metodoEnvio].custo;
  const total = Math.max(0, Math.round((subtotal - desconto + custoEnvio) * 100) / 100);

  for (const item of itensProcessados) {
    const produto = db.produtos.find((p) => p.id === item.produtoId);
    const variacao = produto.variacoes.find((v) => v.tamanho === item.tamanho);
    variacao.estoque -= item.quantidade;
  }

  const numero = formatarNumeroPedido(db.proximoNumeroPedido);
  db.proximoNumeroPedido += 1;

  const pedido = {
    numero,
    data: new Date().toISOString(),
    cliente,
    endereco,
    itens: itensProcessados,
    metodoEnvio,
    prazoEnvio: db.envio[metodoEnvio].prazo,
    cupom: cupomAplicado,
    subtotal,
    desconto,
    frete: custoEnvio,
    total,
    pagamento: {
      metodo: pagamento.metodo,
      mercadoPagoId: pagamento.mercadoPagoId ?? null,
      status: pagamento.status ?? null,
    },
    status: 'Confirmado',
  };

  db.pedidos.push(pedido);
  await writeDb(db);
  res.status(201).json(pedido);
});

router.put('/:numero/status', requireAdmin, async (req, res) => {
  const { status } = req.body;
  const db = await readDb();
  const pedido = db.pedidos.find((p) => p.numero === req.params.numero);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
  pedido.status = status;
  await writeDb(db);
  res.json(pedido);
});

export default router;
