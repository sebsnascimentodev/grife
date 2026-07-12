import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.ADMIN_TOKEN_SECRET || 'grife-dev-secret';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function sign(payloadB64) {
  return createHmac('sha256', SECRET).update(payloadB64).digest('base64url');
}

export function issueToken(usuario) {
  const payload = { u: usuario, exp: Date.now() + TOKEN_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token || !token.includes('.')) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  const [payloadB64, signature] = token.split('.');
  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
  } catch {
    return res.status(401).json({ erro: 'Token inválido' });
  }
  if (!payload.exp || Date.now() > payload.exp) {
    return res.status(401).json({ erro: 'Sessão expirada' });
  }
  req.admin = payload.u;
  next();
}
