import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getProdutos, getEnvio } from '../api.js';

const StoreContext = createContext(null);

export function StoreProvider({ slug, children }) {
  const [produtos, setProdutos] = useState([]);
  const [envio, setEnvio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [produtosData, envioData] = await Promise.all([getProdutos(slug), getEnvio(slug)]);
      setProdutos(produtosData);
      setEnvio(envioData);
      setErro(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [slug]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return (
    <StoreContext.Provider value={{ slug, produtos, envio, carregando, erro, recarregar }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider');
  return ctx;
}
