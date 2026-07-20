import { useAuth } from '../../context/AuthContext.jsx';
import AuthForms from '../../components/AuthForms.jsx';
import './Admin.css';

export default function LojaAdminLogin({ slug }) {
  const { loginNaLoja, autenticado } = useAuth();

  return (
    <div className="admin-login">
      <div className="card admin-login__form">
        <h1 className="titulo">GRIFE. Admin</h1>
        {autenticado && <p className="erro-texto">Esta conta não administra esta loja.</p>}
        <AuthForms somenteLogin login={(email, senha) => loginNaLoja(slug, email, senha)} />
      </div>
    </div>
  );
}
