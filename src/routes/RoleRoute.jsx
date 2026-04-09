import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRutaPorRol } from "../helpers/roleHelper";

function AccessDeniedPage() {
  const { role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container-app py-20 flex flex-col items-center justify-center text-center gap-6">
      <div className="bg-coral/10 border border-coral/10 rounded-2xl p-10 max-w-md w-full shadow-sm">
        <div className="text-5xl mb-4"></div>
        <h2 className="text-2xl font-bold text-navy mb-2">Acceso restringido</h2>
        <p className="text-navy/90 mb-6">
          Tu cuenta no tiene permiso para acceder a esta sección.
        </p>
        <button
          onClick={() => navigate(getRutaPorRol(role))}
          className="px-6 py-2 bg-navy text-white rounded-full font-semibold hover:bg-navy/80 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default function RoleRoute({ children, allowedRoles = [], showAccessDenied = false }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container-app py-20">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

 //if (!user.emailVerified) {
   // return <Navigate to="/verify" replace />;
  //}

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    if (showAccessDenied) {
      return <AccessDeniedPage />;
    }
    return <Navigate to={getRutaPorRol(role)} replace />;
  }

  return children;
}