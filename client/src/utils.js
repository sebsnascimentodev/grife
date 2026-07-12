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
