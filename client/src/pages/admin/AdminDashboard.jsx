import { useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Estoque from './tabs/Estoque.jsx';
import Precos from './tabs/Precos.jsx';
import Promocoes from './tabs/Promocoes.jsx';
import Cupons from './tabs/Cupons.jsx';
import Financeiro from './tabs/Financeiro.jsx';
import Envio from './tabs/Envio.jsx';
import Admins from './tabs/Admins.jsx';
import './Admin.css';

const ABAS = [
  { chave: 'estoque', rotulo: 'Estoque' },
  { chave: 'precos', rotulo: 'Preços' },
  { chave: 'promocoes', rotulo: 'Promoções' },
  { chave: 'cupons', rotulo: 'Cupons' },
  { chave: 'financeiro', rotulo: 'Saldo / Financeiro' },
  { chave: 'envio', rotulo: 'Envio' },
  { chave: 'admins', rotulo: 'Admins' },
];

export default function AdminDashboard({ slug }) {
  const { produtos, envio, recarregar } = useStore();
  const { usuario, logout } = useAuth();
  const [aba, setAba] = useState('estoque');

  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="titulo">
          GRIFE<span style={{ color: 'var(--destaque)' }}>.</span> Admin
        </h1>
        <div className="admin__header-conta">
          <span className="mono">{usuario.nome}</span>
          <button className="btn-outline btn" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <nav className="admin__tabs">
        {ABAS.map((a) => (
          <button
            key={a.chave}
            className={`admin__tab ${aba === a.chave ? 'admin__tab--ativa' : ''}`}
            onClick={() => setAba(a.chave)}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>

      <div className="admin__conteudo">
        {aba === 'estoque' && <Estoque slug={slug} produtos={produtos} recarregar={recarregar} />}
        {aba === 'precos' && <Precos slug={slug} produtos={produtos} recarregar={recarregar} />}
        {aba === 'promocoes' && <Promocoes slug={slug} produtos={produtos} recarregar={recarregar} />}
        {aba === 'cupons' && <Cupons slug={slug} />}
        {aba === 'financeiro' && <Financeiro slug={slug} />}
        {aba === 'envio' && envio && (
          <Envio key={JSON.stringify(envio)} slug={slug} envio={envio} recarregar={recarregar} />
        )}
        {aba === 'admins' && <Admins slug={slug} />}
      </div>
    </div>
  );
}
