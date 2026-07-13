import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, loginUsuario, obterUsuarioAtual, registrarUsuario, setToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarSessao() {
      if (getToken()) {
        try {
          setUsuario(await obterUsuarioAtual());
        } catch {
          setToken(null);
        }
      }
      setCarregando(false);
    }
    carregarSessao();
  }, []);

  async function login(email, senha) {
    setErro(null);
    try {
      const { token, usuario: dados } = await loginUsuario(email, senha);
      setToken(token);
      setUsuario(dados);
      return true;
    } catch (e) {
      setErro(e.message);
      return false;
    }
  }

  async function registrar(payload) {
    setErro(null);
    try {
      const { token, usuario: dados } = await registrarUsuario(payload);
      setToken(token);
      setUsuario(dados);
      return true;
    } catch (e) {
      setErro(e.message);
      return false;
    }
  }

  function logout() {
    setToken(null);
    setUsuario(null);
  }

  const autenticado = !!usuario;
  const ehAdmin = usuario?.papel === 'admin';

  return (
    <AuthContext.Provider value={{ usuario, autenticado, ehAdmin, carregando, erro, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
