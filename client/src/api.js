const TOKEN_KEY = 'grife_admin_token';

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

// --- Público ---
export const getProdutos = () => request('/produtos');
export const getProduto = (id) => request(`/produtos/${id}`);
export const getEnvio = () => request('/envio');
export const validarCupom = (codigo, subtotal) =>
  request('/cupons/validar', { method: 'POST', body: { codigo, subtotal } });
export const criarPedido = (payload) => request('/pedidos', { method: 'POST', body: payload });
export const obterChavePublicaMP = () => request('/pagamento/chave-publica');
export const processarPagamento = (formData) =>
  request('/pagamento/processar', { method: 'POST', body: formData });
export const adminLogin = (usuario, senha) =>
  request('/admin/login', { method: 'POST', body: { usuario, senha } });

// --- Admin ---
export const atualizarPreco = (id, preco) =>
  request(`/produtos/${id}/preco`, { method: 'PUT', body: { preco }, auth: true });
export const atualizarPromocao = (id, promocao) =>
  request(`/produtos/${id}/promocao`, { method: 'PUT', body: promocao, auth: true });
export const atualizarEstoque = (id, tamanho, estoque) =>
  request(`/produtos/${id}/estoque`, { method: 'PUT', body: { tamanho, estoque }, auth: true });
export const listarCupons = () => request('/cupons', { auth: true });
export const criarCupom = (payload) => request('/cupons', { method: 'POST', body: payload, auth: true });
export const atualizarCupom = (codigo, payload) =>
  request(`/cupons/${codigo}`, { method: 'PUT', body: payload, auth: true });
export const excluirCupom = (codigo) => request(`/cupons/${codigo}`, { method: 'DELETE', auth: true });
export const listarPedidos = () => request('/pedidos', { auth: true });
export const atualizarStatusPedido = (numero, status) =>
  request(`/pedidos/${numero}/status`, { method: 'PUT', body: { status }, auth: true });
export const atualizarEnvio = (payload) => request('/envio', { method: 'PUT', body: payload, auth: true });
