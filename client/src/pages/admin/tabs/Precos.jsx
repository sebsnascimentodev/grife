import { useState } from 'react';
import { atualizarPreco } from '../../../api.js';
import { formatarPreco } from '../../../utils.js';

export default function Precos({ slug, produtos, recarregar }) {
  const [salvando, setSalvando] = useState(null);

  async function salvar(produtoId, valor) {
    const preco = Number(valor);
    if (Number.isNaN(preco) || preco < 0) return;
    setSalvando(produtoId);
    await atualizarPreco(slug, produtoId, preco);
    await recarregar();
    setSalvando(null);
  }

  return (
    <div>
      <div className="admin-secao-titulo">
        <h2 className="titulo">Preços</h2>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Preço base</th>
            <th>Preço atual (com promoção)</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>
                <strong>{produto.marca}</strong> {produto.nome}
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={produto.preco}
                  disabled={salvando === produto.id}
                  onBlur={(e) => salvar(produto.id, e.target.value)}
                />
              </td>
              <td>
                {produto.emPromocao ? (
                  <span>
                    <s>{formatarPreco(produto.precoOriginal)}</s> → <strong>{formatarPreco(produto.precoAtual)}</strong>
                  </span>
                ) : (
                  formatarPreco(produto.precoAtual)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
