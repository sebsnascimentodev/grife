import { useState } from 'react';
import { atualizarPromocao } from '../../../api.js';

export default function Promocoes({ produtos, recarregar }) {
  const [rascunhos, setRascunhos] = useState({});

  function rascunho(produto) {
    return rascunhos[produto.id] ?? produto.promocao;
  }

  function atualizarRascunho(produtoId, campo, valor) {
    setRascunhos((atual) => ({
      ...atual,
      [produtoId]: { ...(atual[produtoId] ?? produtos.find((p) => p.id === produtoId).promocao), [campo]: valor },
    }));
  }

  async function salvar(produtoId) {
    const promocao = rascunho(produtos.find((p) => p.id === produtoId));
    await atualizarPromocao(produtoId, promocao);
    await recarregar();
  }

  return (
    <div>
      <div className="admin-secao-titulo">
        <h2 className="titulo">Promoções</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Ativa</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Início</th>
            <th>Fim</th>
            <th>Tag</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => {
            const r = rascunho(produto);
            return (
              <tr key={produto.id}>
                <td>
                  <strong>{produto.marca}</strong> {produto.nome}
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={r.ativa}
                    onChange={(e) => atualizarRascunho(produto.id, 'ativa', e.target.checked)}
                  />
                </td>
                <td>
                  <select value={r.tipo} onChange={(e) => atualizarRascunho(produto.id, 'tipo', e.target.value)}>
                    <option value="percentual">%</option>
                    <option value="fixo">R$</option>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={r.valor}
                    onChange={(e) => atualizarRascunho(produto.id, 'valor', Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={r.inicio ?? ''}
                    onChange={(e) => atualizarRascunho(produto.id, 'inicio', e.target.value || null)}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={r.fim ?? ''}
                    onChange={(e) => atualizarRascunho(produto.id, 'fim', e.target.value || null)}
                  />
                </td>
                <td>{produto.emPromocao ? <span className="admin-badge admin-badge--ok">PROMOÇÃO</span> : '—'}</td>
                <td>
                  <button className="btn-outline btn" type="button" onClick={() => salvar(produto.id)}>
                    Salvar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
