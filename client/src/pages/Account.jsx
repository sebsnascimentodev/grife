import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import AuthForms from '../components/AuthForms.jsx';
import { caminhoLoja } from '../utils.js';
import './Account.css';

export default function Account() {
  const { usuario, autenticado, logout } = useAuth();
  const { slug } = useStore();
  const navigate = useNavigate();

  if (autenticado) {
    return (
      <div className="container account">
        <h1 className="titulo">Minha conta</h1>
        <div className="card account__resumo">
          <p className="mono">Nome</p>
          <p>{usuario.nome}</p>
          <p className="mono">E-mail</p>
          <p>{usuario.email}</p>
          <button className="btn-outline btn" onClick={logout}>
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container account">
      <h1 className="titulo">Minha conta</h1>
      <div className="card account__form">
        <AuthForms onSucesso={() => navigate(caminhoLoja(slug))} />
      </div>
    </div>
  );
}
