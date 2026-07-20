import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { StoreProvider } from '../../context/StoreContext.jsx';
import { listarAdminsLoja } from '../../api.js';
import AdminDashboard from './AdminDashboard.jsx';
import LojaAdminLogin from './LojaAdminLogin.jsx';

// Gate do admin de uma loja específica — /loja/:slug/gerenciar
export default function LojaAdminGate() {
  const { slug } = useParams();
  const { usuario, autenticado, ehSuperAdmin, carregando } = useAuth();
  const [autorizado, setAutorizado] = useState(null); // null = verificando

  useEffect(() => {
    if (carregando || !autenticado) {
      setAutorizado(null);
      return;
    }
    if (ehSuperAdmin) {
      setAutorizado(true);
      return;
    }
    if (usuario?.papel !== 'admin') {
      setAutorizado(false);
      return;
    }
    let cancelado = false;
    listarAdminsLoja(slug)
      .then(() => !cancelado && setAutorizado(true))
      .catch(() => !cancelado && setAutorizado(false));
    return () => {
      cancelado = true;
    };
  }, [slug, usuario, autenticado, ehSuperAdmin, carregando]);

  if (carregando) return null;
  if (!autenticado || autorizado === false) return <LojaAdminLogin slug={slug} />;
  if (autorizado !== true) return null;

  return (
    <StoreProvider slug={slug}>
      <AdminDashboard slug={slug} />
    </StoreProvider>
  );
}
