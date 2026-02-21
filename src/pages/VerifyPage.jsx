import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../lib/firebase";
import { authService } from "../services/authService";
import { Button } from "../components/ui";

export default function VerifyPage() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const resend = async () => {
    setMsg("");
    setErr("");
    try {
      await authService.resendVerificationEmail();
      setMsg("Te reenviamos el correo de verificación. Por favor revisa tu inbox o spam.");
    } catch (e) {
      setErr("No se pudo reenviar. Debes iniciar sesión primero.");
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
        setErr("Tu cuenta aún no se encuentra verificada. Esperá un momento e intenta de nuevo.");
      }
    } catch (e) {
      setErr("No se pudo comprobar la verificación de tu cuenta.");
    }
  };

  return (
    <div className="container-app py-10 max-w-md mx-auto">
      <h1 className="text-3xl font-Fraunces font-semibold">Verifica tu correo</h1>
      <p className="text-sm opacity-70 mt-1 font-sans-serif">
        Te enviamos un email para que actives tu cuenta.
      </p>

      {err && <div className="mt-4 rounded-lg border p-3 text-sm">{err}</div>}
      {msg && <div className="mt-4 rounded-lg border p-3 text-sm">{msg}</div>}

      <div className="mt-6 space-y-3">
        <Button 
        variant="primary"
        size="sm"
        className="w-full rounded-lg border p-2" 
        onClick={resend}>
          Reenviar verificación
        </Button>
        <Button 
        variant="primary"
        size="sm"
        className="w-full rounded-lg border p-2" 
        onClick={iVerified}
        >
          Mi cuenta ha sido verificada
        </Button>
      </div>

      <p className="text-sm opacity-90 mt-6">
        Volver a{" "}
        <Link className="text-sm opacity-90 hover:text-teal-hover transition-colors" to="/login">
          iniciar sesión
        </Link>
      </p>
    </div>
  );
}