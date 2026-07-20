import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

function chaveArmazenamento(slug) {
  return `grife_carrinho_${slug}`;
}

function carregarInicial(slug) {
  try {
    const raw = localStorage.getItem(chaveArmazenamento(slug));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ slug, children }) {
  const [itens, setItens] = useState(() => carregarInicial(slug));

  useEffect(() => {
    setItens(carregarInicial(slug));
  }, [slug]);

  useEffect(() => {
    localStorage.setItem(chaveArmazenamento(slug), JSON.stringify(itens));
  }, [slug, itens]);

  function adicionar(produtoId, tamanho, quantidade = 1) {
    setItens((atual) => {
      const existente = atual.find((i) => i.produtoId === produtoId && i.tamanho === tamanho);
      if (existente) {
        return atual.map((i) =>
          i.produtoId === produtoId && i.tamanho === tamanho
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        );
      }
      return [...atual, { produtoId, tamanho, quantidade }];
    });
  }

  function atualizarQuantidade(produtoId, tamanho, quantidade) {
    setItens((atual) => {
      if (quantidade <= 0) {
        return atual.filter((i) => !(i.produtoId === produtoId && i.tamanho === tamanho));
      }
      return atual.map((i) =>
        i.produtoId === produtoId && i.tamanho === tamanho ? { ...i, quantidade } : i
      );
    });
  }

  function remover(produtoId, tamanho) {
    setItens((atual) => atual.filter((i) => !(i.produtoId === produtoId && i.tamanho === tamanho)));
  }

  function limpar() {
    setItens([]);
  }

  const totalItens = itens.reduce((soma, i) => soma + i.quantidade, 0);

  return (
    <CartContext.Provider
      value={{ itens, adicionar, atualizarQuantidade, remover, limpar, totalItens }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}
