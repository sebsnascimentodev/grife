import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.ADMIN_TOKEN_SECRET || 'grife-dev-secret';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function sign(payloadB64) {
  return createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
}

export function issueToken({ id, papel, lojaId }) {
  const payload = { id, papel, lojaId: lojaId ?? null, exp: Date.now() + TOKEN_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

function lerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token || !token.includes('.')) return null;

  const [payloadB64, signature] = token.split('.');
  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const payload = lerToken(req);
  if (!payload) return res.status(401).json({ erro: 'Não autenticado' });
  req.usuario = payload;
  next();
}

export function requireAdmin(req, res, next) {
  const payload = lerToken(req);
  if (!payload) return res.status(401).json({ erro: 'Não autenticado' });
  if (payload.papel !== 'admin' && payload.papel !== 'superadmin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }
  req.usuario = payload;
  next();
}

export function requireSuperAdmin(req, res, next) {
  const payload = lerToken(req);
  if (!payload) return res.status(401).json({ erro: 'Não autenticado' });
  if (payload.papel !== 'superadmin') return res.status(403).json({ erro: 'Acesso restrito ao super admin' });
  req.usuario = payload;
  next();
}

// Admin da própria loja (req.loja precisa ter sido resolvido antes, por resolveLoja).
// Super admin tem acesso de bypass a qualquer loja.
export function requireLojaAdmin(req, res, next) {
  const payload = lerToken(req);
  if (!payload) return res.status(401).json({ erro: 'Não autenticado' });
  if (payload.papel === 'superadmin') {
    req.usuario = payload;
    return next();
  }
  if (payload.papel !== 'admin' || payload.lojaId !== req.loja?.id) {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador desta loja' });
  }
  req.usuario = payload;
  next();
}
