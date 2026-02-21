import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema } from "../validations/registerSchema";
import { authService } from "../services/authService";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import EyeIcon from "../components/ui/icons/EyeIcon";
import EyeOffIcon from "../components/ui/icons/EyeOffIcon";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      telefono: "",
      correo: "",
      direccion: "",
      dui: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");

    try {
      await authService.register(data);
      navigate("/verify");
    } catch (e) {
      let msg = "No se pudo realizar el registro. Por favor intenta de nuevo.";

      if (e?.code === "auth/email-already-in-use") {
        msg = "Lo sentimos, este correo ya se encuentra registrado.";
      } else if (e?.code === "auth/weak-password") {
        msg = "Contraseña muy débil.";
      } else if (e?.code === "auth/invalid-email") {
        msg = "Correo inválido.";
      } else if (e?.code === "auth/too-many-requests") {
        msg = "Demasiados intentos. Intenta más tarde.";
      }

      setServerError(msg);
    }
  };

  return (
    <div className="container-app py-10 max-w-md mx-auto">
      <h1 className="text-4xl font-semibold font-Fraunces">Crear cuenta</h1>
      <p className="text-sm opacity-70 mt-1">
        Te enviaremos un correo para verificar tu cuenta.
      </p>

      {serverError && (
        <Alert type="error" className="mt-4">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Nombre
          </label>
          <Input
            placeholder="Tu nombre"
            disabled={isSubmitting}
            {...register("nombre")}
          />
          {errors.nombre?.message && (
            <p className="text-sm mt-1 text-red-600">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Apellido
          </label>
          <Input
            placeholder="Tu apellido"
            disabled={isSubmitting}
            {...register("apellido")}
          />
          {errors.apellido?.message && (
            <p className="text-sm mt-1 text-red-600">
              {errors.apellido.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Teléfono (8 dígitos)
          </label>
          <Input
            placeholder="1234-5678"
            inputMode="numeric"
            disabled={isSubmitting}
            {...register("telefono")}
          />
          {errors.telefono?.message && (
            <p className="text-sm mt-1 text-red-600">
              {errors.telefono.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Correo electrónico
          </label>
          <Input
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            disabled={isSubmitting}
            {...register("correo")}
          />
          {errors.correo?.message && (
            <p className="text-sm mt-1 text-red-600">{errors.correo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Dirección
          </label>
          <Input
            placeholder="Tu dirección"
            disabled={isSubmitting}
            {...register("direccion")}
          />
          {errors.direccion?.message && (
            <p className="text-sm mt-1 text-red-600">
              {errors.direccion.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            DUI (00000000-0)
          </label>
          <Input
            placeholder="01234567-8"
            disabled={isSubmitting}
            {...register("dui")}
          />
          {errors.dui?.message && (
            <p className="text-sm mt-1 text-red-600">{errors.dui.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Contraseña
          </label>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={isSubmitting}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-navy/50"
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          {errors.password?.message && (
            <p className="text-sm mt-1 text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </Button>

        <p className="text-center text-sm text-navy/60 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-teal font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;