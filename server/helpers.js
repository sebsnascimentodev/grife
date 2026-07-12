export function promocaoAtiva(promocao) {
  if (!promocao || !promocao.ativa) return false;
  const hoje = new Date();
  if (promocao.inicio && hoje < new Date(promocao.inicio)) return false;
  if (promocao.fim && hoje > new Date(`${promocao.fim}T23:59:59`)) return false;
  return true;
}

export function precoEfetivo(produto) {
  if (!promocaoAtiva(produto.promocao)) return produto.preco;
  const { tipo, valor } = produto.promocao;
  const preco = tipo === 'percentual' ? produto.preco * (1 - valor / 100) : produto.preco - valor;
  return Math.max(0, Math.round(preco * 100) / 100);
}

export function tagExibida(produto) {
  if (promocaoAtiva(produto.promocao)) return 'PROMOÇÃO';
  return produto.tag || null;
}

export function serializeProduto(produto) {
  return {
    ...produto,
    precoOriginal: produto.preco,
    precoAtual: precoEfetivo(produto),
    emPromocao: promocaoAtiva(produto.promocao),
    tagExibida: tagExibida(produto),
  };
}

export function formatarNumeroPedido(numero) {
  return `#GR${String(numero).padStart(6, '0')}`;
}

export function calcularDescontoCupom(cupom, subtotal) {
  if (!cupom) return 0;
  if (cupom.tipo === 'percentual') return Math.round(subtotal * (cupom.valor / 100) * 100) / 100;
  return Math.min(cupom.valor, subtotal);
}

export function cupomStatus(cupom) {
  if (!cupom.ativo) return 'inativo';
  if (new Date() > new Date(`${cupom.validade}T23:59:59`)) return 'expirado';
  if (cupom.usosAtuais >= cupom.limiteUso) return 'esgotado';
  return 'ativo';
}
