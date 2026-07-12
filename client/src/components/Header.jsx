import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import './Header.css';

export default function Header() {
  const { totalItens } = useCart();

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo titulo">
          GRIFE<span className="header__ponto">.</span>
        </Link>
        <Link to="/carrinho" className="header__carrinho" aria-label="Carrinho">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="9" cy="21" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="19" cy="21" r="1.2" fill="currentColor" stroke="none" />
            <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H6" />
          </svg>
          {totalItens > 0 && <span className="header__contador">{totalItens}</span>}
        </Link>
      </div>
    </header>
  );
}
