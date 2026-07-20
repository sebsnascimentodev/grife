import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { validarCupom } from '../api.js';
import { caminhoLoja, formatarPreco, calcularSubtotal } from '../utils.js';
import './Cart.css';

export default function Cart() {
  const { itens, atualizarQuantidade, remover } = useCart();
  const { slug, produtos, envio } = useStore();
  const navigate = useNavigate();
  const [codigoCupom, setCodigoCupom] = useState('');
  const [cupom, setCupom] = useState(null);
  const [erroCupom, setErroCupom] = useState(null);

  const itensDetalhados = itens
    .map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      if (!produto) return null;
      const variacao = produto.variacoes.find((v) => v.tamanho === item.tamanho);
      return { ...item, produto, estoqueDisponivel: variacao?.estoque ?? 0 };
    })
    .filter(Boolean);

  const subtotal = calcularSubtotal(itens, produtos);
  const freteGratisMinimo = envio?.freteGratisMinimo ?? 0;
  const faltamParaFreteGratis = Math.max(0, freteGratisMinimo - subtotal);

  let desconto = 0;
  if (cupom) {
    desconto = cupom.tipo === 'percentual' ? subtotal * (cupom.valor / 100) : Math.min(cupom.valor, subtotal);
  }

  async function aplicarCupom(e) {
    e.preventDefault();
    setErroCupom(null);
    try {
      const resultado = await validarCupom(slug, codigoCupom, subtotal);
      setCupom(resultado);
    } catch (e) {
      setCupom(null);
      setErroCupom(e.message);
    }
  }

  if (itensDetalhados.length === 0) {
    return (
      <div className="container cart cart--vazio">
        <h1 className="titulo">Sua sacola está vazia</h1>
        <Link to={caminhoLoja(slug)} className="btn">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart">
      <h1 className="titulo">Sacola</h1>

      <div className="cart__frete-msg mono">
        {faltamParaFreteGratis > 0
          ? `Faltam ${formatarPreco(faltamParaFreteGratis)} para frete grátis`
          : 'Você ganhou frete grátis!'}
      </div>

      <div className="cart__layout">
        <ul className="cart__itens">
          {itensDetalhados.map((item) => (
            <li key={`${item.produtoId}-${item.tamanho}`} className="cart__item card">
              <div className="cart__item-imagem">
                {item.produto.imagem ? (
                  <img src={item.produto.imagem} alt={item.produto.nome} />
                ) : (
                  <span className="titulo">{item.produto.marca[0]}</span>
                )}
              </div>
              <div className="cart__item-info">
                <p className="mono">{item.produto.marca}</p>
                <p className="cart__item-nome">{item.produto.nome}</p>
                <p className="mono">Tamanho {item.tamanho}</p>
                <div className="cart__item-qtd">
                  <button
                    onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantidade}</span>
                  <button
                    disabled={item.quantidade >= item.estoqueDisponivel}
                    onClick={() => atualizarQuantidade(item.produtoId, item.tamanho, item.quantidade + 1)}
                  >
                    +
                  </button>
                </div>
                <button className="cart__item-remover mono" onClick={() => remover(item.produtoId, item.tamanho)}>
                  Remover
                </button>
              </div>
              <div className="cart__item-precos">
                <p className="mono">{formatarPreco(item.produto.precoAtual)} un.</p>
                <p className="cart__item-subtotal">{formatarPreco(item.produto.precoAtual * item.quantidade)}</p>
              </div>
            </li>
          ))}
        </ul>

        <aside className="cart__resumo card">
          <h2 className="titulo">Resumo</h2>

          <form className="cart__cupom" onSubmit={aplicarCupom}>
            <input
              placeholder="Cupom de desconto"
              value={codigoCupom}
              onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
            />
            <button className="btn-outline btn" type="submit">
              Aplicar
            </button>
          </form>
          {erroCupom && <p className="erro-texto">{erroCupom}</p>}
          {cupom && <p className="mono cart__cupom-ok">Cupom {cupom.codigo} aplicado</p>}

          <div className="cart__linha">
            <span className="mono">Subtotal</span>
            <span>{formatarPreco(subtotal)}</span>
          </div>
          {desconto > 0 && (
            <div className="cart__linha">
              <span className="mono">Desconto</span>
              <span>-{formatarPreco(desconto)}</span>
            </div>
          )}
          <div className="cart__linha">
            <span className="mono">Frete</span>
            <span>calculado no checkout</span>
          </div>
          <div className="cart__linha cart__linha--total">
            <span className="mono">Total estimado</span>
            <span>{formatarPreco(Math.max(0, subtotal - desconto))}</span>
          </div>

          <button
            className="btn cart__finalizar"
            onClick={() =>
              navigate(caminhoLoja(slug, '/checkout'), { state: { cupom: cupom ? { codigo: cupom.codigo } : null } })
            }
          >
            Ir para o checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
