import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import EyeIcon from "../components/ui/icons/EyeIcon";
import EyeOffIcon from "../components/ui/icons/EyeOffIcon";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Por favor completa todos los campos");
      }

      await signInWithEmailAndPassword(auth, email, password);
      navigate(location.state?.from || "/");
    } catch (err) {
      let mensaje = "Error al ingresar";
      if (err.code === "auth/invalid-credential") {
        mensaje = "Email o contraseña incorrectos";
      } else if (err.code === "auth/user-not-found") {
        mensaje = "Usuario no registrado";
      } else if (err.code === "auth/too-many-requests") {
        mensaje = "Demasiados intentos. Intenta más tarde";
      }
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(location.state?.from || "/");
    } catch (err) {
      console.error("Error con Google:", err);
      setError("Error al ingresar con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <p className="text-sm opacity-70 mt-1">Ingresa tu correo y contraseña.</p>

      {error && (
        <Alert type="error" className="mt-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Correo
          </label>
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-navy/50"
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full mt-6">
          {loading ? "Cargando..." : "Ingresar"}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-navy/20 flex-1" />
        <span className="text-sm text-navy/50">O continúa con</span>
        <div className="h-px bg-navy/20 flex-1" />
      </div>

      {/* Google Login */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full border-2 border-navy/20 rounded-lg py-2 px-4 font-semibold text-navy hover:bg-navy/5 transition disabled:opacity-50"
      >
        Google
      </button>

      {/* Register Link */}
      <p className="text-center text-sm text-navy/60 mt-6">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="text-coral font-semibold hover:underline"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
