import { createContext, useContext, useState } from 'react';
import { adminLogin, getToken, setToken } from '../api.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(!!getToken());
  const [erro, setErro] = useState(null);

  async function login(usuario, senha) {
    setErro(null);
    try {
      const { token } = await adminLogin(usuario, senha);
      setToken(token);
      setAutenticado(true);
      return true;
    } catch (e) {
      setErro(e.message);
      return false;
    }
  }

  function logout() {
    setToken(null);
    setAutenticado(false);
  }

  return (
    <AdminAuthContext.Provider value={{ autenticado, erro, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider');
  return ctx;
}
