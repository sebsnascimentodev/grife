import { useAuth } from '../../context/AuthContext.jsx';
import AuthForms from '../../components/AuthForms.jsx';
import './Admin.css';

// Admin inicial semeado automaticamente pelo backend (server/index.js) a partir
// das variáveis ADMIN_EMAIL / ADMIN_SENHA do .env. Padrão de demonstração:
// admin@grife.com / grife2024
export default function AdminLogin() {
  const { usuario, autenticado } = useAuth();
  const naoAutorizado = autenticado && usuario.papel !== 'admin';

  return (
    <div className="admin-login">
      <div className="card admin-login__form">
        <h1 className="titulo">GRIFE. Admin</h1>
        {naoAutorizado && <p className="erro-texto">Esta conta não tem acesso ao painel administrativo.</p>}
        <AuthForms somenteLogin />
      </div>
    </div>
  );
}
