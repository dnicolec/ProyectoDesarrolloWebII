import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { authService } from "./services/authService";
import RoleRoute from "./routes/RoleRoute";
import { ROLES } from "./helpers/roleHelper";
import { CartProvider } from "./context/CartContext";

// Layouts
import Layout from "./layout/Layout";
import AdminLayout from "./layout/AdminLayout";
import ScrollToTop from "./layout/ScrollTop";
import CompanyLayout from "./layout/CompanyLayout";
import EmployeeLayout from "./layout/EmployeeLayout";

// Public pages
import HomePage from "./pages/public/HomePage";
import OfferDetailPage from "./pages/public/OfferDetailPage";
import NotFoundPage from "./pages/public/NotFoundPage";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyPage from "./pages/auth/VerifyPage";
import PasswordPage from "./pages/auth/PasswordPage";
import ChangePassPage from "./pages/auth/ChangePassPage";

// Client pages
import MyCouponsPage from "./pages/client/MyCouponsPage";
import CouponDetailPage from "./pages/client/CouponDetailPage";
import CheckoutPage from "./pages/client/CheckoutPage";
import CartPage from "./pages/client/CartPage";

// Admin pages
import CompaniesPage from "./pages/admin/CompaniesPage";
import CompanyDetailPage from "./pages/admin/CompanyDetailPage";
import RubrosPage from "./pages/admin/RubrosPage";
import ClientsPage from "./pages/admin/ClientsPage";
import ClientDetailPage from "./pages/admin/ClientDetailPage";
import OfertasPendientesPage from "./pages/admin/OfertasPendientesPage";

// Company pages
import OffersPage from "./pages/company/OffersPage";
import EmployeesPage from "./pages/company/EmployeesPage";

// Employee pages
import RedeemCouponsPage from "./pages/employee/RedeemCouponsPage";

// Dev pages (remove before production)
import SeedPage from "./pages/dev/SeedPage";
import Loading from "./components/ui/loading";

function App() {
  const { user, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading || isLoggingOut) {
    return <Loading />;
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Rutas públicas */}
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/offer/:id"
              element={<OfferDetailPage user={user} />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Rutas de autenticación */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <RegisterPage />}
          />

          <Route path="/verify" element={<VerifyPage />} />

          <Route path="/password" element={<PasswordPage />} />

          {/* Rutas del panel administrador */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={[ROLES.ADMIN_CUPONERA]}>
                <AdminLayout user={user} onLogout={handleLogout} />
              </RoleRoute>
            }
          >
            <Route index element={<Navigate to="/admin/empresas" replace />} />
            <Route path="empresas" element={<CompaniesPage />} />
            <Route path="empresas/:id" element={<CompanyDetailPage />} />
            <Route path="rubros" element={<RubrosPage />} />
            <Route
              path="ofertas/pendientes"
              element={<OfertasPendientesPage />}
            />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="clientes/:id" element={<ClientDetailPage />} />
            <Route path="password" element={<PasswordPage />} />
            {/* Ruta de desarrollo: Esta hay que eliminarla antes de que hagamos un deploy en produccion */}
            <Route path="seed" element={<SeedPage />} />
          </Route>

          {/* Rutas del panel de la Empresa */}
          <Route
            path="/empresa"
            element={
              <RoleRoute allowedRoles={[ROLES.ADMIN_EMPRESA]}>
                <CompanyLayout user={user} onLogout={handleLogout} />
              </RoleRoute>
            }
          >
            <Route index element={<Navigate to="/empresa/ofertas" replace />} />
            <Route path="ofertas" element={<OffersPage />} />
            <Route path="empleados" element={<EmployeesPage />} />
            <Route
              path="password"
              element={<ChangePassPage user={user} onLogout={handleLogout} />}
            />
          </Route>

          {/* Rutas del panel de empleado */}
          <Route
            path="/empleado"
            element={
              <RoleRoute allowedRoles={[ROLES.EMPLEADO]}>
                <EmployeeLayout user={user} onLogout={handleLogout} />
              </RoleRoute>
            }
          >
            <Route index element={<RedeemCouponsPage user={user} />} />
            <Route
              path="password"
              element={<ChangePassPage user={user} onLogout={handleLogout} />}
            />
          </Route>

          {/* Rutas protegidas */}
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route
              path="/my-coupons"
              element={
                <RoleRoute allowedRoles={[ROLES.CLIENTE]} showAccessDenied>
                  <MyCouponsPage user={user} />
                </RoleRoute>
              }
            />
            <Route
              path="/my-coupons/:id"
              element={
                <RoleRoute allowedRoles={[ROLES.CLIENTE]} showAccessDenied>
                  <CouponDetailPage user={user} />
                </RoleRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <RoleRoute allowedRoles={[ROLES.CLIENTE]}>
                  <CartPage user={user} />
                </RoleRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <RoleRoute allowedRoles={[ROLES.CLIENTE]}>
                  <CheckoutPage user={user} />
                </RoleRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
