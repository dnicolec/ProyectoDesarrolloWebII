import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

export default function PasswordPage() {
  const [correo, setCorreo] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
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
      <h1 className="text-3xl font-semibold">
        Recuperar contraseña
      </h1>

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

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
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

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-4"
        >
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
    </div>
  );
}