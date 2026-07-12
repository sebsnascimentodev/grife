import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import AdminGate from './pages/admin/AdminGate.jsx';

function LojaLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Rota administrativa oculta — não linkada em nenhum lugar do site público */}
              <Route path="/gerenciar-x9k2" element={<AdminGate />} />

              <Route element={<LojaLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/produto/:id" element={<ProductPage />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/confirmacao/:numero" element={<Confirmation />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </CartProvider>
    </StoreProvider>
  );
}
