import { useAuth } from '../../context/AuthContext.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';

export default function AdminGate() {
  const { ehAdmin, carregando } = useAuth();
  if (carregando) return null;
  return ehAdmin ? <AdminDashboard /> : <AdminLogin />;
}
