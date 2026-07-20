// Loja original, servida nas rotas sem prefixo (/, /produto/:id, ...) por compatibilidade
// com os links já existentes. Lojas novas vivem em /loja/:slug/...
export const DEFAULT_LOJA_SLUG = 'grife';

// Monta um caminho interno considerando a loja atual: a loja padrão usa as rotas
// "raiz" (sem prefixo), as demais usam /loja/:slug/...
export function caminhoLoja(slug, sufixo = '') {
  if (!slug || slug === DEFAULT_LOJA_SLUG) return sufixo || '/';
  return `/loja/${slug}${sufixo}`;
}

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarPreco(valor) {
  return formatoMoeda.format(valor);
}

export function calcularSubtotal(itensCarrinho, produtos) {
  return itensCarrinho.reduce((soma, item) => {
    const produto = produtos.find((p) => p.id === item.produtoId);
    if (!produto) return soma;
    return soma + produto.precoAtual * item.quantidade;
  }, 0);
}

export function estoqueDaVariacao(produto, tamanho) {
  return produto?.variacoes.find((v) => v.tamanho === tamanho)?.estoque ?? 0;
}
