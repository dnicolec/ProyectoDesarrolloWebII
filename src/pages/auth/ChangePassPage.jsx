import { updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { auth, db } from "../../lib/firebase";

export default function ChangePassPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [passwords, setPasswords] = useState({
    nueva: "",
    confirmacion: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (passwords.nueva.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }
    if (passwords.nueva !== passwords.confirmacion) {
      setError("Las contraseñas deben coincidir");
      setLoading(false);
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No hay sesión activa");
      await updatePassword(currentUser, passwords.nueva);
      const userRef = doc(db, "usuarios", currentUser.uid);
      await updateDoc(userRef, {
        mustChangePass: false,
      });
      setSuccess(true);

      await updateDoc(userRef, {
        mustChangePass: false,
      });

      const userSnap = await getDoc(userRef);
      const userRole = userSnap.data().role;

      const rutaDestino =
        userRole === "admin_empresa" ? "/empresa" : "/empleado";

      setSuccess(true);

      setTimeout(() => {
        navigate(rutaDestino, { replace: true });
      }, 2000);
    } catch (error) {
      console.error(error);

      if (error.code === "auth/requires-recent-login") {
        setError(
          "Debes cerrar sesión y volver a entrar para realizar esta acción",
        );
      } else {
        setError("Ocurrió un error al actualizar la contraseña");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-cream-bg flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-cream p-8 rounded-2xl shadow-sm max-w-md w-full animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-sage-dark"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-navy">
            Actualizar Contraseña
          </h1>
          <p className="text-sm text-navy/50 mt-1">
            Ingresa tu nueva clave de acceso seguro.
          </p>
        </div>

        {error && (
          <div className="bg-coral/10 border border-coral/30 text-coral text-sm rounded-xl px-4 py-3 mb-4 font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-teal/10 border border-teal/30 text-teal text-center rounded-xl px-4 py-6">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mx-auto mb-2"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="font-bold">Contraseña actualizada</p>
            <p className="text-sm mt-1 opacity-80">Redirigiendo al panel...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nueva contraseña"
              type="password"
              required
              value={passwords.nueva}
              onChange={(e) =>
                setPasswords({ ...passwords, nueva: e.target.value })
              }
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              required
              value={passwords.confirmacion}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmacion: e.target.value })
              }
            />

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Guardar y continuar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
