import { useEffect, useState } from 'react';
import { atualizarStatusPedido, listarPedidos } from '../../../api.js';
import { formatarPreco } from '../../../utils.js';

const TAXA_SIMULADA = 0.05;
const STATUS_OPCOES = ['Confirmado', 'Em preparação', 'Enviado', 'Entregue', 'Cancelado'];

export default function Financeiro() {
  const [pedidos, setPedidos] = useState([]);

  async function carregar() {
    setPedidos(await listarPedidos());
  }

  useEffect(() => {
    carregar();
  }, []);

  const pedidosValidos = pedidos.filter((p) => p.status !== 'Cancelado');
  const totalVendido = pedidosValidos.reduce((soma, p) => soma + p.total, 0);
  const taxas = totalVendido * TAXA_SIMULADA;
  const saldoDisponivel = totalVendido - taxas;

  async function mudarStatus(numero, status) {
    await atualizarStatusPedido(numero, status);
    await carregar();
  }

  return (
    <div>
      <div className="admin-secao-titulo">
        <h2 className="titulo">Saldo / Financeiro</h2>
      </div>

      <div className="admin-financeiro-cards">
        <div className="card admin-financeiro-card">
          <p className="mono">Total vendido</p>
          <p className="valor">{formatarPreco(totalVendido)}</p>
        </div>
        <div className="card admin-financeiro-card">
          <p className="mono">Taxas simuladas (5%)</p>
          <p className="valor">{formatarPreco(taxas)}</p>
        </div>
        <div className="card admin-financeiro-card">
          <p className="mono">Saldo disponível</p>
          <p className="valor">{formatarPreco(saldoDisponivel)}</p>
        </div>
        <div className="card admin-financeiro-card">
          <p className="mono">Pedidos</p>
          <p className="valor">{pedidos.length}</p>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Itens</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {pedidos
            .slice()
            .reverse()
            .map((p) => (
              <tr key={p.numero}>
                <td>{p.numero}</td>
                <td>{new Date(p.data).toLocaleString('pt-BR')}</td>
                <td>{p.cliente.nome}</td>
                <td>{p.itens.reduce((soma, i) => soma + i.quantidade, 0)} itens</td>
                <td>{formatarPreco(p.total)}</td>
                <td>
                  <select value={p.status} onChange={(e) => mudarStatus(p.numero, e.target.value)}>
                    {STATUS_OPCOES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          {pedidos.length === 0 && (
            <tr>
              <td colSpan={6} className="mono">
                Nenhum pedido ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
