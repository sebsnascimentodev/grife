import { useAuth } from '../../context/AuthContext.jsx';
import AdminLogin from './AdminLogin.jsx';
import PlatformDashboard from './PlatformDashboard.jsx';

// Gate do super admin (dono da plataforma) — /gerenciar-x9k2
export default function AdminGate() {
  const { ehSuperAdmin, carregando } = useAuth();
  if (carregando) return null;
  return ehSuperAdmin ? <PlatformDashboard /> : <AdminLogin />;
}
