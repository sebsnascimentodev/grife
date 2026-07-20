import { randomUUID } from 'crypto';
import { cpfValido, limparCpf } from './cpf.js';
import { gerarHashSenha } from './senha.js';

export function sanitizar(usuario) {
  const { senhaHash, ...resto } = usuario;
  return resto;
}

export async function criarUsuario({ nome, email, cpf, senha, papel, lojaId = null }, db) {
  const emailNormalizado = String(email || '').trim().toLowerCase();
  const cpfLimpo = limparCpf(cpf);

  if (!nome || !emailNormalizado || !senha) {
    throw { status: 400, erro: 'Nome, e-mail e senha são obrigatórios' };
  }
  if (senha.length < 6) {
    throw { status: 400, erro: 'A senha precisa ter pelo menos 6 caracteres' };
  }
  if (!cpfValido(cpfLimpo)) {
    throw { status: 400, erro: 'CPF inválido' };
  }
  if (db.usuarios.some((u) => u.email === emailNormalizado)) {
    throw { status: 409, erro: 'Já existe uma conta com este e-mail' };
  }
  if (db.usuarios.some((u) => u.cpf === cpfLimpo)) {
    throw { status: 409, erro: 'Este CPF já está associado a uma conta' };
  }

  const usuario = {
    id: randomUUID(),
    nome,
    email: emailNormalizado,
    cpf: cpfLimpo,
    senhaHash: gerarHashSenha(senha),
    papel,
    lojaId,
    criadoEm: new Date().toISOString(),
  };
  db.usuarios.push(usuario);
  return usuario;
}
