import { Link, useLocation, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { caminhoLoja, formatarPreco } from '../utils.js';
import './Confirmation.css';

export default function Confirmation() {
  const { numero } = useParams();
  const { slug } = useStore();
  const location = useLocation();
  const pedido = location.state?.pedido;

  if (!pedido) {
    return (
      <div className="container confirmation">
        <p className="mono">Não encontramos os detalhes do pedido #GR{numero}.</p>
        <Link to={caminhoLoja(slug)} className="btn">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="container confirmation">
      <p className="mono">Pedido confirmado</p>
      <h1 className="titulo confirmation__numero">{pedido.numero}</h1>
      <p className="tag confirmation__status">{pedido.status}</p>

      <div className="card confirmation__resumo">
        <h2 className="mono">Itens</h2>
        <ul className="confirmation__itens">
          {pedido.itens.map((item) => (
            <li key={`${item.produtoId}-${item.tamanho}`}>
              <span>
                {item.marca} {item.nome} — {item.tamanho} x{item.quantidade}
              </span>
              <span>{formatarPreco(item.precoUnitario * item.quantidade)}</span>
            </li>
          ))}
        </ul>

        <div className="cart__linha">
          <span className="mono">Subtotal</span>
          <span>{formatarPreco(pedido.subtotal)}</span>
        </div>
        {pedido.desconto > 0 && (
          <div className="cart__linha">
            <span className="mono">Desconto</span>
            <span>-{formatarPreco(pedido.desconto)}</span>
          </div>
        )}
        <div className="cart__linha">
          <span className="mono">Frete</span>
          <span>{formatarPreco(pedido.frete)}</span>
        </div>
        <div className="cart__linha cart__linha--total">
          <span className="mono">Total</span>
          <span>{formatarPreco(pedido.total)}</span>
        </div>
      </div>

      <Link to={caminhoLoja(slug)} className="btn">
        Voltar para a loja
      </Link>
    </div>
  );
}
