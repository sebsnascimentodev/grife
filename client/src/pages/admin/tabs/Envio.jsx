import { useState } from 'react';
import { atualizarEnvio } from '../../../api.js';

export default function Envio({ envio, recarregar }) {
  const [form, setForm] = useState(envio);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    await atualizarEnvio(form);
    await recarregar();
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  return (
    <div>
      <div className="admin-secao-titulo">
        <h2 className="titulo">Envio</h2>
      </div>
      <form className="card admin-form-inline" style={{ gridTemplateColumns: '1fr 1fr' }} onSubmit={salvar}>
        <div>
          <p className="mono">Frete padrão — custo</p>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.padrao.custo}
            onChange={(e) => setForm({ ...form, padrao: { ...form.padrao, custo: Number(e.target.value) } })}
          />
        </div>
        <div>
          <p className="mono">Frete padrão — prazo</p>
          <input
            value={form.padrao.prazo}
            onChange={(e) => setForm({ ...form, padrao: { ...form.padrao, prazo: e.target.value } })}
          />
        </div>
        <div>
          <p className="mono">Frete expresso — custo</p>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.expresso.custo}
            onChange={(e) => setForm({ ...form, expresso: { ...form.expresso, custo: Number(e.target.value) } })}
          />
        </div>
        <div>
          <p className="mono">Frete expresso — prazo</p>
          <input
            value={form.expresso.prazo}
            onChange={(e) => setForm({ ...form, expresso: { ...form.expresso, prazo: e.target.value } })}
          />
        </div>
        <div>
          <p className="mono">Mínimo p/ frete grátis (padrão)</p>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.freteGratisMinimo}
            onChange={(e) => setForm({ ...form, freteGratisMinimo: Number(e.target.value) })}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button className="btn" type="submit" disabled={salvando}>
            {salvo ? 'Salvo ✓' : salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
