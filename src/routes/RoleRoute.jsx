import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRutaPorRol } from "../helpers/roleHelper";

export default function RoleRoute({ children, allowedRoles = [] }) {
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
    return <Navigate to={getRutaPorRol(role)} replace />;
  }

  return children;
}