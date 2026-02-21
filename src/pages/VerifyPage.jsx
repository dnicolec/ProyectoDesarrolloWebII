import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth } from "../lib/firebase";
import { authService } from "../services/authService";

import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

const VerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      await authService.resendVerificationEmail();
      setMsg(
        "Te reenviamos el correo de verificación. Por favor revisa tu inbox o spam."
      );
    } catch (e) {
      setErr("No se pudo reenviar. Debes iniciar sesión primero.");
    } finally {
      setLoading(false);
    }
  };
  
  const iVerified = async () => {
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      if (!auth.currentUser) {
        setErr("Iniciá sesión para comprobar tu verificación.");
        return;
      }

      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        navigate(location.state?.from || "/");
      } else {
        setErr(
          "Tu cuenta aún no se encuentra verificada. Esperá un momento e intenta de nuevo."
        );
      }
    } catch (e) {
      setErr("No se pudo comprobar la verificación de tu cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Verifica tu correo</h1>
      <p className="text-sm opacity-70 mt-1">
        Te enviamos un email para que actives tu cuenta.
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

      <div className="mt-6 space-y-3">
        <Button onClick={resend} disabled={loading} className="w-full">
          {loading ? "Enviando..." : "Reenviar verificación"}
        </Button>

        <Button
          onClick={iVerified}
          disabled={loading}
          className="w-full"
          variant="secondary"
        >
          {loading ? "Comprobando..." : "Mi cuenta ya fue verificada"}
        </Button>
      </div>

      <p className="text-center text-sm text-navy/60 mt-6">
        Volver a{" "}
        <Link to="/login" className="text-teal font-semibold hover:underline">
          iniciar sesión
        </Link>
      </p>
    </div>
  );
};

export default VerifyPage;