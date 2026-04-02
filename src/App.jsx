import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { CartProvider } from "./context/CartContext";

// Layouts
import Layout from "./layout/Layout";
import AdminLayout from "./layout/AdminLayout";
import ScrollToTop from "./layout/ScrollTop";

// Public pages
import HomePage from "./pages/public/HomePage";
import OfferDetailPage from "./pages/public/OfferDetailPage";
import NotFoundPage from "./pages/public/NotFoundPage";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyPage from "./pages/auth/VerifyPage";
import PasswordPage from "./pages/auth/PasswordPage";

// Client pages
import MyCouponsPage from "./pages/client/MyCouponsPage";
import CouponDetailPage from "./pages/client/CouponDetailPage";
import CheckoutPage from "./pages/client/CheckoutPage";
import CartPage from "./pages/client/CartPage";

// Admin pages
import CompaniesPage from "./pages/admin/CompaniesPage";
import CompanyDetailPage from "./pages/admin/CompanyDetailPage";

function ProtectedRoute({ children, user, loading }) {
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }
  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} />
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitorear cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Componente para rutas protegidas definido fuera de App para evitar crear
  // componentes durante el render.

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Rutas públicas */}
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/offer/:id" element={<OfferDetailPage user={user} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Rutas de autenticación */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <RegisterPage />}
          />

          <Route path="/verify" element={<VerifyPage />} />

          {/* Rutas del panel administrador */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <AdminLayout user={user} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/empresas" replace />} />
            <Route path="empresas" element={<CompaniesPage />} />
            <Route path="empresas/:id" element={<CompanyDetailPage />} />
          </Route>

          {/* Rutas protegidas */}
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route
              path="/my-coupons"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <MyCouponsPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-coupons/:id"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <CouponDetailPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <CartPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <CheckoutPage user={user} />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
