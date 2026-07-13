import { useEffect, useState } from 'react';
import { criarAdmin, listarAdmins } from '../../../api.js';
import { cpfValido } from '../../../cpf.js';

const VAZIO = { nome: '', email: '', cpf: '', senha: '' };

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [novo, setNovo] = useState(VAZIO);
  const [erro, setErro] = useState(null);

  async function carregar() {
    setAdmins(await listarAdmins());
  }

  useEffect(() => {
    carregar();
  }, []);

  async function onCriar(e) {
    e.preventDefault();
    setErro(null);
    if (!cpfValido(novo.cpf)) {
      setErro('CPF inválido');
      return;
    }
    try {
      await criarAdmin(novo);
      setNovo(VAZIO);
      await carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <div className="admin-secao-titulo">
        <h2 className="titulo">Admins</h2>
      </div>

      <form className="card admin-form-inline" onSubmit={onCriar}>
        <input
          placeholder="Nome"
          required
          value={novo.nome}
          onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
        />
        <input
          placeholder="E-mail"
          type="email"
          required
          value={novo.email}
          onChange={(e) => setNovo({ ...novo, email: e.target.value })}
        />
        <input
          placeholder="CPF"
          required
          value={novo.cpf}
          onChange={(e) => setNovo({ ...novo, cpf: e.target.value })}
        />
        <input
          placeholder="Senha"
          type="password"
          required
          minLength={6}
          value={novo.senha}
          onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
        />
        <button className="btn" type="submit">
          Criar admin
        </button>
      </form>
      {erro && <p className="erro-texto">{erro}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Criado em</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td>{a.nome}</td>
              <td>{a.email}</td>
              <td>{new Date(a.criadoEm).toLocaleDateString('pt-BR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
