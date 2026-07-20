import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { cpfValido } from '../cpf.js';
import './AuthForms.css';

export default function AuthForms({
  onSucesso,
  tituloEntrar = 'Entrar',
  tituloCriar = 'Criar conta',
  somenteLogin = false,
  login: loginCustom,
}) {
  const { login: loginPadrao, registrar, erro } = useAuth();
  const login = loginCustom ?? loginPadrao;
  const [aba, setAba] = useState('entrar');
  const [enviando, setEnviando] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [cadastro, setCadastro] = useState({ nome: '', email: '', cpf: '', senha: '' });
  const [erroCpf, setErroCpf] = useState(null);

  async function aoEntrar(e) {
    e.preventDefault();
    setEnviando(true);
    const ok = await login(loginForm.email, loginForm.senha);
    setEnviando(false);
    if (ok) onSucesso?.();
  }

  async function aoCriarConta(e) {
    e.preventDefault();
    if (!cpfValido(cadastro.cpf)) {
      setErroCpf('CPF inválido');
      return;
    }
    setErroCpf(null);
    setEnviando(true);
    const ok = await registrar(cadastro);
    setEnviando(false);
    if (ok) onSucesso?.();
  }

  return (
    <div className="auth-forms">
      {!somenteLogin && (
        <div className="auth-forms__tabs">
          <button
            type="button"
            className={`mono auth-forms__tab ${aba === 'entrar' ? 'auth-forms__tab--ativa' : ''}`}
            onClick={() => setAba('entrar')}
          >
            {tituloEntrar}
          </button>
          <button
            type="button"
            className={`mono auth-forms__tab ${aba === 'criar' ? 'auth-forms__tab--ativa' : ''}`}
            onClick={() => setAba('criar')}
          >
            {tituloCriar}
          </button>
        </div>
      )}

      {(somenteLogin || aba === 'entrar') && (
        <form className="auth-forms__form" onSubmit={aoEntrar}>
          <input
            placeholder="E-mail"
            type="email"
            required
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
          />
          <input
            placeholder="Senha"
            type="password"
            required
            value={loginForm.senha}
            onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
          />
          {erro && <p className="erro-texto">{erro}</p>}
          <button className="btn" type="submit" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      )}

      {aba === 'criar' && (
        <form className="auth-forms__form" onSubmit={aoCriarConta}>
          <input
            placeholder="Nome completo"
            required
            value={cadastro.nome}
            onChange={(e) => setCadastro({ ...cadastro, nome: e.target.value })}
          />
          <input
            placeholder="E-mail"
            type="email"
            required
            value={cadastro.email}
            onChange={(e) => setCadastro({ ...cadastro, email: e.target.value })}
          />
          <input
            placeholder="CPF"
            required
            value={cadastro.cpf}
            onChange={(e) => setCadastro({ ...cadastro, cpf: e.target.value })}
          />
          {erroCpf && <p className="erro-texto">{erroCpf}</p>}
          <input
            placeholder="Senha (mín. 6 caracteres)"
            type="password"
            required
            minLength={6}
            value={cadastro.senha}
            onChange={(e) => setCadastro({ ...cadastro, senha: e.target.value })}
          />
          {erro && <p className="erro-texto">{erro}</p>}
          <button className="btn" type="submit" disabled={enviando}>
            {enviando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
      )}
    </div>
  );
}
