import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function gerarHashSenha(senha) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verificarSenha(senha, hashArmazenado) {
  const [salt, hashHex] = String(hashArmazenado || '').split(':');
  if (!salt || !hashHex) return false;
  const hash = scryptSync(senha, salt, 64);
  const armazenado = Buffer.from(hashHex, 'hex');
  return hash.length === armazenado.length && timingSafeEqual(hash, armazenado);
}
