import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";

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
      setMsg("Listo. Te enviamos un correo para restablecer tu contraseña.");
    } catch (e2) {
      const text =
        e2?.code === "auth/invalid-email"
          ? "Correo inválido."
          : e2?.code === "auth/user-not-found"
          ? "No existe una cuenta con ese correo."
          : "No se pudo enviar el correo. Intenta de nuevo.";
      setErr(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Recuperar y cambiar contraseña</h1>
      <p className="text-sm opacity-70 mt-1">
        Ingresa tu correo y te enviaremos un enlace para que puedas restablecer tu contraseña.
      </p>

      {err && <div className="mt-4 rounded-lg border p-3 text-sm">{err}</div>}
      {msg && <div className="mt-4 rounded-lg border p-3 text-sm">{msg}</div>}

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

        <button
          disabled={loading}
          className="w-full rounded-lg border p-2 font-medium"
          type="submit"
        >
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>

        <p className="text-sm opacity-70">
          Volver a{" "}
          <Link className="underline" to="/login">
            iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
}