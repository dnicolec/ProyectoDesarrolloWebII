import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validations/registerSchema";
import { authService } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await authService.register(data);
      navigate("/verify"); // la creamos en el siguiente paso
    } catch (e) {
      const msg =
        e?.code === "auth/email-already-in-use"
          ? "Ese correo ya está registrado."
          : e?.code === "auth/weak-password"
          ? "Contraseña muy débil."
          : "No se pudo registrar. Intenta de nuevo.";
      setServerError(msg);
    }
  };

  return (
    <div className="container-app py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <p className="text-sm opacity-70 mt-1">
        Te enviaremos un correo para verificar tu cuenta.
      </p>

      {serverError && (
        <div className="mt-4 rounded-lg border p-3 text-sm">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Field label="Nombre" error={errors.nombre?.message}>
          <input className="w-full rounded-lg border p-2" {...register("nombre")} />
        </Field>

        <Field label="Apellido" error={errors.apellido?.message}>
          <input className="w-full rounded-lg border p-2" {...register("apellido")} />
        </Field>

        <Field label="Teléfono (8 dígitos)" error={errors.telefono?.message}>
          <input
            className="w-full rounded-lg border p-2"
            {...register("telefono")}
            inputMode="numeric"
            placeholder="77778888"
          />
        </Field>

        <Field label="Correo" error={errors.correo?.message}>
          <input
            className="w-full rounded-lg border p-2"
            {...register("correo")}
            type="email"
            autoComplete="email"
          />
        </Field>

        <Field label="Dirección" error={errors.direccion?.message}>
          <input className="w-full rounded-lg border p-2" {...register("direccion")} />
        </Field>

        <Field label="DUI (00000000-0)" error={errors.dui?.message}>
          <input className="w-full rounded-lg border p-2" {...register("dui")} placeholder="01234567-8" />
        </Field>

        <Field label="Contraseña" error={errors.password?.message}>
          <input
            className="w-full rounded-lg border p-2"
            {...register("password")}
            type="password"
            autoComplete="new-password"
          />
        </Field>

        <button
          disabled={isSubmitting}
          className="w-full rounded-lg border p-2 font-medium"
          type="submit"
        >
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </button>

        <p className="text-sm opacity-70">
          ¿Ya tenés cuenta?{" "}
          <Link className="underline" to="/login">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="text-sm mt-1">{error}</p>}
    </div>
  );
}