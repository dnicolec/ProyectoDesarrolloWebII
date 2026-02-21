import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../lib/firebase";
import { authService } from "../services/authService";

export default function VerifyPage() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const resend = async () => {
    setMsg("");
    setErr("");
    try {
      await authService.resendVerificationEmail();
      setMsg("Te reenviamos el correo de verificación. Revisá inbox/spam.");
    } catch (err) {
      console.error(err);
      setErr("No se pudo reenviar. Iniciá sesión primero.");
    }
  };

  const iVerified = async () => {
    setMsg("");
    setErr("");
    try {
      if (!auth.currentUser) {
        setErr("Iniciá sesión para comprobar tu verificación.");
        return;
      }

      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        navigate("/");
      } else {
        setErr("Aún no aparece verificada. Esperá un momento y probá otra vez.");
      }
    } catch (err) {
      console.error(err);
      setErr("No se pudo comprobar la verificación.");
    }
  };

  return (
    <div className="container-app py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Verificá tu correo</h1>
      <p className="text-sm opacity-70 mt-1">
        Te enviamos un email para activar tu cuenta.
      </p>

      {err && <div className="mt-4 rounded-lg border p-3 text-sm">{err}</div>}
      {msg && <div className="mt-4 rounded-lg border p-3 text-sm">{msg}</div>}

      <div className="mt-6 space-y-3">
        <button className="w-full rounded-lg border p-2" onClick={resend}>
          Reenviar verificación
        </button>
        <button className="w-full rounded-lg border p-2" onClick={iVerified}>
          Ya verifiqué
        </button>
      </div>

      <p className="text-sm opacity-70 mt-6">
        Volver a{" "}
        <Link className="underline" to="/login">
          iniciar sesión
        </Link>
      </p>
    </div>
  );
}