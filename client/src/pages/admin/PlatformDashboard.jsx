import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { atualizarLoja, criarLoja, listarLojas } from '../../api.js';
import { formatarPreco } from '../../utils.js';
import './Admin.css';

const LOJA_VAZIA = {
  nome: '',
  slug: '',
  plano: { valor: 200, cicloDias: 30 },
  admin: { nome: '', email: '', cpf: '', senha: '' },
};

export default function PlatformDashboard() {
  const { usuario, logout } = useAuth();
  const [lojas, setLojas] = useState([]);
  const [nova, setNova] = useState(LOJA_VAZIA);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function carregar() {
    setLojas(await listarLojas());
  }

  useEffect(() => {
    carregar();
  }, []);

  async function onCriar(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await criarLoja(nova);
      setNova(LOJA_VAZIA);
      await carregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function alternarStatus(loja) {
    await atualizarLoja(loja.id, { status: loja.status === 'ativa' ? 'suspensa' : 'ativa' });
    await carregar();
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="titulo">
          GRIFE<span style={{ color: 'var(--destaque)' }}>.</span> Plataforma
        </h1>
        <div className="admin__header-conta">
          <span className="mono">{usuario.nome}</span>
          <button className="btn-outline btn" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <div className="admin__conteudo">
        <div className="admin-secao-titulo">
          <h2 className="titulo">Lojas</h2>
        </div>

        <form className="card admin-form-inline" onSubmit={onCriar}>
          <input
            placeholder="Nome da loja"
            required
            value={nova.nome}
            onChange={(e) => setNova({ ...nova, nome: e.target.value })}
          />
          <input
            placeholder="Slug (ex: minha-loja)"
            required
            value={nova.slug}
            onChange={(e) => setNova({ ...nova, slug: e.target.value.toLowerCase() })}
          />
          <input
            type="number"
            placeholder="Taxa mensal (R$)"
            min="0"
            value={nova.plano.valor}
            onChange={(e) => setNova({ ...nova, plano: { ...nova.plano, valor: Number(e.target.value) } })}
          />
          <input
            placeholder="Nome do admin da loja"
            required
            value={nova.admin.nome}
            onChange={(e) => setNova({ ...nova, admin: { ...nova.admin, nome: e.target.value } })}
          />
          <input
            placeholder="E-mail do admin"
            type="email"
            required
            value={nova.admin.email}
            onChange={(e) => setNova({ ...nova, admin: { ...nova.admin, email: e.target.value } })}
          />
          <input
            placeholder="CPF do admin"
            required
            value={nova.admin.cpf}
            onChange={(e) => setNova({ ...nova, admin: { ...nova.admin, cpf: e.target.value } })}
          />
          <input
            placeholder="Senha do admin"
            type="password"
            required
            minLength={6}
            value={nova.admin.senha}
            onChange={(e) => setNova({ ...nova, admin: { ...nova.admin, senha: e.target.value } })}
          />
          <button className="btn" type="submit" disabled={enviando}>
            {enviando ? 'Criando...' : 'Criar loja'}
          </button>
        </form>
        {erro && <p className="erro-texto">{erro}</p>}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Loja</th>
              <th>Slug</th>
              <th>Plano</th>
              <th>Produtos</th>
              <th>Pedidos</th>
              <th>Total vendido</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lojas.map((loja) => (
              <tr key={loja.id}>
                <td>
                  <strong>{loja.nome}</strong>
                </td>
                <td className="mono">{loja.slug}</td>
                <td>{formatarPreco(loja.plano.valor)}/mês</td>
                <td>{loja.metricas.produtos}</td>
                <td>{loja.metricas.pedidos}</td>
                <td>{formatarPreco(loja.metricas.totalVendido)}</td>
                <td>
                  <span className={`admin-badge ${loja.status === 'ativa' ? 'admin-badge--ok' : 'admin-badge--erro'}`}>
                    {loja.status}
                  </span>
                </td>
                <td>
                  <button className="btn-outline btn" type="button" onClick={() => alternarStatus(loja)}>
                    {loja.status === 'ativa' ? 'Suspender' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
            {lojas.length === 0 && (
              <tr>
                <td colSpan={8} className="mono">
                  Nenhuma loja cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
