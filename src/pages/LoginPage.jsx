import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setLoading(true);

    try {
      const user = await authService.login(correo, password);

      // Si no verificó correo debe volver a iniciar sesión 
      if (!user.emailVerified) {
        await authService.logout();
        navigate("/verify");
        return;
      }

      navigate("/"); 
    } catch (e2) {
      const msg =
        e2?.code === "auth/invalid-credential"
          ? "Correo o contraseña incorrectos."
          : e2?.code === "auth/too-many-requests"
          ? "Demasiados intentos. Probá más tarde."
          : e2?.code === "auth/network-request-failed"
          ? "Problema de red. Revisá tu conexión."
          : "No se pudo iniciar sesión.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <p className="text-sm opacity-70 mt-1">Entrá con tu correo y contraseña.</p>

      {serverError && (
        <div className="mt-4 rounded-lg border p-3 text-sm">{serverError}</div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm">Correo</label>
          <input
            className="w-full rounded-lg border p-2 mt-1"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="text-sm">Contraseña</label>
          <input
            className="w-full rounded-lg border p-2 mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg border p-2 font-medium"
          type="submit"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="flex items-center justify-between text-sm opacity-80">
          <Link className="underline" to="/password">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link className="underline" to="/register">
            Crear cuenta
          </Link>
        </div>
      </form>
    </div>
  );
}