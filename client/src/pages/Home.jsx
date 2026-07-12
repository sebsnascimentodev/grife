import { useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import './Home.css';

const CATEGORIAS = ['Todos', 'Masculino', 'Feminino', 'Calçados', 'Acessórios'];

export default function Home() {
  const { produtos, carregando, erro } = useStore();
  const [categoria, setCategoria] = useState('Todos');

  const filtrados =
    categoria === 'Todos' ? produtos : produtos.filter((p) => p.categoria === categoria);

  return (
    <div className="home container">
      <section className="home__hero">
        <h1 className="titulo home__titulo">
          STREETWEAR <span className="home__destaque">DE VERDADE</span>.
        </h1>
        <p className="mono">Nike · Adidas · Lacoste · Hugo Boss · Polo · Saint Laurent</p>
      </section>

      <nav className="home__categorias">
        {CATEGORIAS.map((c) => (
          <button
            key={c}
            className={`home__categoria mono ${categoria === c ? 'home__categoria--ativa' : ''}`}
            onClick={() => setCategoria(c)}
          >
            {c}
          </button>
        ))}
      </nav>

      {carregando && <p className="mono">Carregando catálogo...</p>}
      {erro && <p className="erro-texto">{erro}</p>}

      <div className="home__grid">
        {filtrados.map((produto) => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </div>
    </div>
  );
}
