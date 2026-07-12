import { Link } from 'react-router-dom';
import { formatarPreco } from '../utils.js';
import './ProductCard.css';

export default function ProductCard({ produto }) {
  const esgotado = produto.variacoes.every((v) => v.estoque === 0);

  return (
    <Link to={`/produto/${produto.id}`} className="product-card">
      <div className="product-card__imagem">
        <span className="titulo">{produto.marca[0]}</span>
        {produto.tagExibida && <span className="tag product-card__tag">{produto.tagExibida}</span>}
        {esgotado && <span className="tag tag-esgotado product-card__tag product-card__tag--esgotado">ESGOTADO</span>}
      </div>
      <div className="product-card__info">
        <p className="mono">{produto.marca}</p>
        <p className="product-card__nome">{produto.nome}</p>
        <p className="product-card__preco">
          {produto.emPromocao && (
            <span className="product-card__preco-original">{formatarPreco(produto.precoOriginal)}</span>
          )}
          {formatarPreco(produto.precoAtual)}
        </p>
      </div>
    </Link>
  );
}
