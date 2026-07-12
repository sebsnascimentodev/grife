import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';

export default function AdminGate() {
  const { autenticado } = useAdminAuth();
  return autenticado ? <AdminDashboard /> : <AdminLogin />;
}
