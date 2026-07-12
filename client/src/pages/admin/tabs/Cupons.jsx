import { useEffect, useState } from 'react';
import { atualizarCupom, criarCupom, excluirCupom, listarCupons } from '../../../api.js';

const CUPOM_VAZIO = {
  codigo: '',
  tipo: 'percentual',
  valor: 10,
  valorMinimo: 0,
  validade: '',
  limiteUso: 100,
  usoUnicoPorCliente: false,
};

const badgeStatus = {
  ativo: 'admin-badge--ok',
  expirado: 'admin-badge--erro',
  esgotado: 'admin-badge--erro',
  inativo: 'admin-badge--aviso',
};

export default function Cupons() {
  const [cupons, setCupons] = useState([]);
  const [novo, setNovo] = useState(CUPOM_VAZIO);
  const [erro, setErro] = useState(null);

  async function carregar() {
    setCupons(await listarCupons());
  }

  useEffect(() => {
    carregar();
  }, []);

  async function onCriar(e) {
    e.preventDefault();
    setErro(null);
    try {
      await criarCupom({ ...novo, codigo: novo.codigo.toUpperCase() });
      setNovo(CUPOM_VAZIO);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function toggleAtivo(cupom) {
    await atualizarCupom(cupom.codigo, { ativo: !cupom.ativo });
    await carregar();
  }

  async function remover(codigo) {
    await excluirCupom(codigo);
    await carregar();
  }

  return (
    <div>
      <div className="admin-secao-titulo">
        <h2 className="titulo">Cupons</h2>
      </div>

      <form className="card admin-form-inline" onSubmit={onCriar}>
        <input
          placeholder="Código"
          required
          value={novo.codigo}
          onChange={(e) => setNovo({ ...novo, codigo: e.target.value })}
        />
        <select value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}>
          <option value="percentual">% desconto</option>
          <option value="fixo">R$ desconto</option>
        </select>
        <input
          type="number"
          placeholder="Valor"
          min="0"
          value={novo.valor}
          onChange={(e) => setNovo({ ...novo, valor: Number(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Compra mínima"
          min="0"
          value={novo.valorMinimo}
          onChange={(e) => setNovo({ ...novo, valorMinimo: Number(e.target.value) })}
        />
        <input
          type="date"
          required
          value={novo.validade}
          onChange={(e) => setNovo({ ...novo, validade: e.target.value })}
        />
        <input
          type="number"
          placeholder="Limite de uso"
          min="1"
          value={novo.limiteUso}
          onChange={(e) => setNovo({ ...novo, limiteUso: Number(e.target.value) })}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input
            type="checkbox"
            checked={novo.usoUnicoPorCliente}
            onChange={(e) => setNovo({ ...novo, usoUnicoPorCliente: e.target.checked })}
          />
          <span className="mono">Único/cliente</span>
        </label>
        <button className="btn" type="submit">
          Criar cupom
        </button>
      </form>
      {erro && <p className="erro-texto">{erro}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Desconto</th>
            <th>Mín. compra</th>
            <th>Validade</th>
            <th>Uso</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cupons.map((c) => (
            <tr key={c.codigo}>
              <td>{c.codigo}</td>
              <td>{c.tipo === 'percentual' ? `${c.valor}%` : `R$ ${c.valor}`}</td>
              <td>R$ {c.valorMinimo}</td>
              <td>{c.validade}</td>
              <td>
                {c.usosAtuais}/{c.limiteUso}
                {c.usoUnicoPorCliente ? ' (único/cliente)' : ''}
              </td>
              <td>
                <span className={`admin-badge ${badgeStatus[c.status]}`}>{c.status}</span>
              </td>
              <td style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn-outline btn" type="button" onClick={() => toggleAtivo(c)}>
                  {c.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button className="btn-outline btn" type="button" onClick={() => remover(c.codigo)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
