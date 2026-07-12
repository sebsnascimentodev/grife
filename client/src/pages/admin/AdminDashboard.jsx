import { useState } from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import Estoque from './tabs/Estoque.jsx';
import Precos from './tabs/Precos.jsx';
import Promocoes from './tabs/Promocoes.jsx';
import Cupons from './tabs/Cupons.jsx';
import Financeiro from './tabs/Financeiro.jsx';
import Envio from './tabs/Envio.jsx';
import './Admin.css';

const ABAS = [
  { chave: 'estoque', rotulo: 'Estoque' },
  { chave: 'precos', rotulo: 'Preços' },
  { chave: 'promocoes', rotulo: 'Promoções' },
  { chave: 'cupons', rotulo: 'Cupons' },
  { chave: 'financeiro', rotulo: 'Saldo / Financeiro' },
  { chave: 'envio', rotulo: 'Envio' },
];

export default function AdminDashboard() {
  const { produtos, envio, recarregar } = useStore();
  const { logout } = useAdminAuth();
  const [aba, setAba] = useState('estoque');

  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="titulo">
          GRIFE<span style={{ color: 'var(--destaque)' }}>.</span> Admin
        </h1>
        <button className="btn-outline btn" onClick={logout}>
          Sair
        </button>
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
        {aba === 'estoque' && <Estoque produtos={produtos} recarregar={recarregar} />}
        {aba === 'precos' && <Precos produtos={produtos} recarregar={recarregar} />}
        {aba === 'promocoes' && <Promocoes produtos={produtos} recarregar={recarregar} />}
        {aba === 'cupons' && <Cupons />}
        {aba === 'financeiro' && <Financeiro />}
        {aba === 'envio' && envio && <Envio key={JSON.stringify(envio)} envio={envio} recarregar={recarregar} />}
      </div>
    </div>
  );
}
