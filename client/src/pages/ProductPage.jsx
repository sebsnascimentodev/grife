import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { formatarPreco, estoqueDaVariacao } from '../utils.js';
import './ProductPage.css';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { produtos, carregando } = useStore();
  const { adicionar } = useCart();
  const [tamanho, setTamanho] = useState(null);
  const [erroTamanho, setErroTamanho] = useState(false);
  const [adicionado, setAdicionado] = useState(false);

  const produto = produtos.find((p) => p.id === id);

  if (carregando) return <p className="container mono">Carregando...</p>;
  if (!produto) return <p className="container mono">Produto não encontrado.</p>;

  const relacionados = produtos
    .filter((p) => p.id !== produto.id && p.categoria === produto.categoria)
    .slice(0, 4);

  function selecionarTamanho(t) {
    setTamanho(t);
    setErroTamanho(false);
  }

  function adicionarASacola() {
    if (!tamanho) {
      setErroTamanho(true);
      return;
    }
    adicionar(produto.id, tamanho, 1);
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  }

  return (
    <div className="product-page container">
      <div className="product-page__topo">
        <div className="product-page__imagem">
          <span className="titulo">{produto.marca[0]}</span>
          {produto.tagExibida && <span className="tag">{produto.tagExibida}</span>}
        </div>

        <div className="product-page__detalhes">
          <p className="mono">{produto.marca}</p>
          <h1 className="titulo product-page__nome">{produto.nome}</h1>
          <p className="product-page__preco">
            {produto.emPromocao && (
              <span className="product-page__preco-original">{formatarPreco(produto.precoOriginal)}</span>
            )}
            {formatarPreco(produto.precoAtual)}
          </p>
          <p className="product-page__descricao">{produto.descricao}</p>

          <div className="product-page__tamanhos">
            <p className="mono">Tamanho {erroTamanho && <span className="erro-texto">— selecione um tamanho</span>}</p>
            <div className={`product-page__tamanhos-lista ${erroTamanho ? 'product-page__tamanhos-lista--erro' : ''}`}>
              {produto.variacoes.map((v) => {
                const esgotado = v.estoque === 0;
                return (
                  <button
                    key={v.tamanho}
                    disabled={esgotado}
                    className={`product-page__tamanho ${tamanho === v.tamanho ? 'product-page__tamanho--ativo' : ''}`}
                    onClick={() => selecionarTamanho(v.tamanho)}
                    title={esgotado ? 'Esgotado' : undefined}
                  >
                    {v.tamanho}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="btn product-page__btn" onClick={adicionarASacola}>
            {adicionado ? 'Adicionado ✓' : 'Adicionar à sacola'}
          </button>

          {tamanho && (
            <p className="mono product-page__estoque">
              {estoqueDaVariacao(produto, tamanho)} unidades disponíveis
            </p>
          )}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="product-page__relacionados">
          <h2 className="titulo">Você também pode gostar</h2>
          <div className="product-page__relacionados-grid">
            {relacionados.map((p) => (
              <ProductCard key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}

      <button className="btn-outline btn product-page__voltar" onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  );
}
