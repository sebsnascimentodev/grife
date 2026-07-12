import { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import './Admin.css';

// Credenciais fixas de demonstração (mesmas do backend, server/routes/admin.js):
// usuário: admin | senha: grife2024
export default function AdminLogin() {
  const { login, erro } = useAdminAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    await login(usuario, senha);
    setEnviando(false);
  }

  return (
    <div className="admin-login">
      <form className="card admin-login__form" onSubmit={onSubmit}>
        <h1 className="titulo">GRIFE. Admin</h1>
        <input placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
        <input
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        {erro && <p className="erro-texto">{erro}</p>}
        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
