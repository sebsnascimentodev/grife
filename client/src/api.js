const TOKEN_KEY = 'grife_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const erro = new Error(data?.erro || `Erro ${res.status}`);
    erro.status = res.status;
    throw erro;
  }
  return data;
}

// --- Público (escopado por loja) ---
export const getInfoLoja = (slug) => request(`/lojas/${slug}/info`);
export const getProdutos = (slug) => request(`/lojas/${slug}/produtos`);
export const getProduto = (slug, id) => request(`/lojas/${slug}/produtos/${id}`);
export const getEnvio = (slug) => request(`/lojas/${slug}/envio`);
export const validarCupom = (slug, codigo, subtotal) =>
  request(`/lojas/${slug}/cupons/validar`, { method: 'POST', body: { codigo, subtotal } });
export const criarPedido = (slug, payload) => request(`/lojas/${slug}/pedidos`, { method: 'POST', body: payload });
export const obterChavePublicaMP = () => request('/pagamento/chave-publica');
export const processarPagamento = (formData) =>
  request('/pagamento/processar', { method: 'POST', body: formData });

// --- Conta (cliente ou super admin) ---
export const registrarUsuario = (payload) => request('/usuarios/registrar', { method: 'POST', body: payload });
export const loginUsuario = (email, senha) =>
  request('/usuarios/login', { method: 'POST', body: { email, senha } });
export const obterUsuarioAtual = () => request('/usuarios/me', { auth: true });

// --- Super admin: plataforma ---
export const listarAdmins = () => request('/usuarios/admins', { auth: true });
export const criarAdmin = (payload) => request('/usuarios/admins', { method: 'POST', body: payload, auth: true });
export const listarLojas = () => request('/lojas', { auth: true });
export const criarLoja = (payload) => request('/lojas', { method: 'POST', body: payload, auth: true });
export const atualizarLoja = (id, payload) => request(`/lojas/${id}`, { method: 'PUT', body: payload, auth: true });

// --- Admin de loja (escopado por slug) ---
export const loginLoja = (slug, email, senha) =>
  request(`/lojas/${slug}/login`, { method: 'POST', body: { email, senha } });
export const listarAdminsLoja = (slug) => request(`/lojas/${slug}/admins`, { auth: true });
export const criarAdminLoja = (slug, payload) =>
  request(`/lojas/${slug}/admins`, { method: 'POST', body: payload, auth: true });
export const atualizarPreco = (slug, id, preco) =>
  request(`/lojas/${slug}/produtos/${id}/preco`, { method: 'PUT', body: { preco }, auth: true });
export const atualizarPromocao = (slug, id, promocao) =>
  request(`/lojas/${slug}/produtos/${id}/promocao`, { method: 'PUT', body: promocao, auth: true });
export const atualizarEstoque = (slug, id, tamanho, estoque) =>
  request(`/lojas/${slug}/produtos/${id}/estoque`, { method: 'PUT', body: { tamanho, estoque }, auth: true });
export const listarCupons = (slug) => request(`/lojas/${slug}/cupons`, { auth: true });
export const criarCupom = (slug, payload) => request(`/lojas/${slug}/cupons`, { method: 'POST', body: payload, auth: true });
export const atualizarCupom = (slug, codigo, payload) =>
  request(`/lojas/${slug}/cupons/${codigo}`, { method: 'PUT', body: payload, auth: true });
export const excluirCupom = (slug, codigo) => request(`/lojas/${slug}/cupons/${codigo}`, { method: 'DELETE', auth: true });
export const listarPedidos = (slug) => request(`/lojas/${slug}/pedidos`, { auth: true });
export const atualizarStatusPedido = (slug, numero, status) =>
  request(`/lojas/${slug}/pedidos/${numero}/status`, { method: 'PUT', body: { status }, auth: true });
export const atualizarEnvio = (slug, payload) =>
  request(`/lojas/${slug}/envio`, { method: 'PUT', body: payload, auth: true });
