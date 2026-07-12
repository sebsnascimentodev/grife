import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { issueToken } from '../auth.js';

const router = Router();

// Credenciais fixas apenas para simular restrição de acesso ao painel admin.
// usuário: admin  |  senha: grife2024
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'grife2024';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});

router.post('/login', loginLimiter, (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === ADMIN_USER && senha === ADMIN_PASS) {
    return res.json({ token: issueToken(ADMIN_USER) });
  }
  res.status(401).json({ erro: 'Usuário ou senha inválidos' });
});

export default router;
