import { BrowserRouter, Routes, Route, Outlet, useParams } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DEFAULT_LOJA_SLUG } from './utils.js';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Account from './pages/Account.jsx';
import AdminGate from './pages/admin/AdminGate.jsx';
import LojaAdminGate from './pages/admin/LojaAdminGate.jsx';

// A loja padrão (grife) responde nas rotas sem prefixo, por compatibilidade com
// os links já existentes. Demais lojas vivem em /loja/:slug/...
function LojaPublicLayout() {
  const { slug = DEFAULT_LOJA_SLUG } = useParams();
  return (
    <StoreProvider slug={slug}>
      <CartProvider slug={slug}>
        <Header />
        <main>
          <Outlet />
        </main>
      </CartProvider>
    </StoreProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota oculta do super admin — dono da plataforma, gerencia as lojas */}
          <Route path="/gerenciar-x9k2" element={<AdminGate />} />
          {/* Painel de administração de cada loja */}
          <Route path="/loja/:slug/gerenciar" element={<LojaAdminGate />} />

          <Route element={<LojaPublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/produto/:id" element={<ProductPage />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmacao/:numero" element={<Confirmation />} />
            <Route path="/conta" element={<Account />} />
          </Route>

          <Route path="/loja/:slug" element={<LojaPublicLayout />}>
            <Route index element={<Home />} />
            <Route path="produto/:id" element={<ProductPage />} />
            <Route path="carrinho" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="confirmacao/:numero" element={<Confirmation />} />
            <Route path="conta" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
