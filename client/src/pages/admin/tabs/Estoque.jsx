import { useState } from 'react';
import { atualizarEstoque } from '../../../api.js';

const LIMITE_ESTOQUE_BAIXO = 3;

export default function Estoque({ produtos, recarregar }) {
  const [salvando, setSalvando] = useState(null);

  async function salvar(produtoId, tamanho, valor) {
    const estoque = Number(valor);
    if (Number.isNaN(estoque) || estoque < 0) return;
    setSalvando(`${produtoId}-${tamanho}`);
    await atualizarEstoque(produtoId, tamanho, estoque);
    await recarregar();
    setSalvando(null);
  }

  return (
    <div>
      <div className="admin-secao-titulo">
        <h2 className="titulo">Estoque</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Tamanho</th>
            <th>Estoque</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) =>
            produto.variacoes.map((v, idx) => (
              <tr key={`${produto.id}-${v.tamanho}`}>
                {idx === 0 && (
                  <td rowSpan={produto.variacoes.length}>
                    <strong>{produto.marca}</strong> {produto.nome}
                  </td>
                )}
                <td>{v.tamanho}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    defaultValue={v.estoque}
                    disabled={salvando === `${produto.id}-${v.tamanho}`}
                    onBlur={(e) => salvar(produto.id, v.tamanho, e.target.value)}
                  />
                </td>
                <td>
                  {v.estoque === 0 && <span className="admin-badge admin-badge--erro">Esgotado</span>}
                  {v.estoque > 0 && v.estoque <= LIMITE_ESTOQUE_BAIXO && (
                    <span className="admin-badge admin-badge--aviso">Estoque baixo</span>
                  )}
                  {v.estoque > LIMITE_ESTOQUE_BAIXO && <span className="admin-badge admin-badge--ok">OK</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
