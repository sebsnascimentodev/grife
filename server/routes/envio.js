import { Router } from 'express';
import { readDb, writeDb } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const db = await readDb();
  res.json(db.envio);
});

router.put('/', requireAdmin, async (req, res) => {
  const { padrao, expresso, freteGratisMinimo } = req.body;
  const db = await readDb();
  if (padrao) db.envio.padrao = { ...db.envio.padrao, ...padrao };
  if (expresso) db.envio.expresso = { ...db.envio.expresso, ...expresso };
  if (freteGratisMinimo !== undefined) db.envio.freteGratisMinimo = Number(freteGratisMinimo);
  await writeDb(db);
  res.json(db.envio);
});

export default router;
