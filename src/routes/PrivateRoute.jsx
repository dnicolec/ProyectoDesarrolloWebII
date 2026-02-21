import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="container-app py-20">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  //Exigir verificación del usuario
  if (!user.emailVerified) return <Navigate to="/verify" replace />;

  return children;
}