import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/layout/ScrollTop";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OfferDetailPage from "./pages/OfferDetailPage";
import MyCouponsPage from "./pages/MyCouponsPage";
import NotFoundPage from "./pages/NotFoundPage";

function ProtectedRoute({ children, user, loading }) {
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} />;
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
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/my-coupons"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <ProtectedRoute user={user} loading={loading}>
                <MyCouponsPage />
              </ProtectedRoute>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;