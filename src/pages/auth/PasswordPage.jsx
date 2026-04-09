import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { getRutaPorRol } from "../../helpers/roleHelper";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";

export default function PasswordPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  // ---- Estado para usuario autenticado (cambiar contraseña) ----
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ---- Estado para usuario NO autenticado (recuperar contraseña) ----
  const [correo, setCorreo] = useState("");

  // ---- Estado general ----
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- Cambiar contraseña (usuario logueado) ----
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErr("Por favor completa todos los campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErr("Las contraseñas nuevas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      setErr("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // Re-autenticar antes de cambiar la contraseña (requerido por Firebase)
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Cambiar la contraseña
      await authService.changePassword(newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate(getRutaPorRol(role));
    } catch (e2) {
      if (
        e2?.code === "auth/wrong-password" ||
        e2?.code === "auth/invalid-credential"
      ) {
        setErr("La contraseña actual es incorrecta.");
      } else if (e2?.code === "auth/weak-password") {
        setErr("La nueva contraseña es muy débil. Usa al menos 6 caracteres.");
      } else if (e2?.code === "auth/requires-recent-login") {
        setErr(
          "Por seguridad, debes volver a iniciar sesión antes de cambiar la contraseña."
        );
      } else {
        setErr("No se pudo actualizar la contraseña. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---- Recuperar contraseña por correo (usuario NO logueado) ----
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      await authService.resetPassword(correo);
      setMsg(
        "Te enviamos un enlace para restablecer tu contraseña. Por favor verifica tu correo."
      );
    } catch (e2) {
      const text =
        e2?.code === "auth/invalid-email"
          ? "Correo inválido."
          : e2?.code === "auth/user-not-found"
          ? "No existe una cuenta con ese correo."
          : "No se pudo enviar el correo. Por favor, intenta de nuevo.";
      setErr(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-10 max-w-md mx-auto">
      {/* Usuario autenticado */}
      {user ? (
        <>
          <h1 className="text-3xl font-semibold">Cambiar contraseña</h1>
          <p className="text-sm opacity-70 mt-1">
            Ingresa tu contraseña actual y elige una nueva.
          </p>

          {err && (
            <Alert type="error" className="mt-4">
              {err}
            </Alert>
          )}

          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Contraseña actual
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Nueva contraseña
              </label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Confirmar nueva contraseña
              </label>
              <Input
                type="password"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </Button>

            <p className="text-center text-sm text-navy/60 mt-4">
              <button
                type="button"
                onClick={() => navigate(getRutaPorRol(role))}
                className="text-teal font-semibold hover:underline"
              >
                Volver al inicio
              </button>
            </p>
          </form>
        </>
      ) : (
        <>
          {/* Usuario no autenticado */}
          <h1 className="text-3xl font-semibold">Recuperar contraseña</h1>
          <p className="text-sm opacity-70 mt-1">
            Ingresa tu correo para restablecer tu contraseña.
          </p>

          {err && (
            <Alert type="error" className="mt-4">
              {err}
            </Alert>
          )}
          {msg && (
            <Alert type="success" className="mt-4">
              {msg}
            </Alert>
          )}

          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? "Enviando..." : "Enviar enlace"}
            </Button>

            <p className="text-center text-sm text-navy/60 mt-6">
              Volver a{" "}
              <Link
                to="/login"
                className="text-teal font-semibold hover:underline"
              >
                iniciar sesión
              </Link>
            </p>
          </form>
        </>
      )}
    </div>
  );
}