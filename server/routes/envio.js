import { Router } from 'express';
import { writeDb } from '../db.js';
import { requireLojaAdmin } from '../auth.js';
import { requireLojaAtiva } from './lojas.js';

const router = Router();

router.get('/', requireLojaAtiva, async (req, res) => {
  res.json(req.loja.envio);
});

router.put('/', requireLojaAdmin, async (req, res) => {
  const { padrao, expresso, freteGratisMinimo } = req.body;
  if (padrao) req.loja.envio.padrao = { ...req.loja.envio.padrao, ...padrao };
  if (expresso) req.loja.envio.expresso = { ...req.loja.envio.expresso, ...expresso };
  if (freteGratisMinimo !== undefined) req.loja.envio.freteGratisMinimo = Number(freteGratisMinimo);
  await writeDb(req.db);
  res.json(req.loja.envio);
});

export default router;
