import { doc, setDoc, updateDoc, collection } from "firebase/firestore";
import { db, firebaseConfig } from "../../lib/firebase";
import { useState } from "react";
import { Modal, Input, Button, Alert } from "../../components/ui";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";

// creamos conexión fantasma para poder crear los empleados y que se puedan registrar
const appFantasma = initializeApp(firebaseConfig, "AppFantasma");
const authFantasma = getAuth(appFantasma);

export default function EmployeeModal({
  empleado,
  empresaId,
  onClose,
  onGuardado,
}) {
  const [formData, setFormData] = useState({
    nombre: empleado?.nombre || "",
    apellido: empleado?.apellido || "",
    correo: empleado?.correo || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (empleado) {
        const empleadoRef = doc(db, "usuarios", empleado.id);
        await updateDoc(empleadoRef, {
          nombre: formData.nombre,
          apellido: formData.apellido,
        });
        Alert("Datos del empleado actualizados");
      } else {
        // contraseña default
        const passwordTemporal = import.meta.env.VITE_DEFAULT_PASSWORD;
        const userCredential = await createUserWithEmailAndPassword(
          authFantasma,
          formData.correo,
          passwordTemporal,
        );
        const nuevoUid = userCredential.user.uid;

        await setDoc(doc(db, "usuarios", nuevoUid), {
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          role: "empleado",
          empresaId: empresaId,
          mustChangePass: true,
          createdAt: new Date().toISOString(),
          dui: "",
          telefono: "",
          direccion: "",
        });

        await signOut(authFantasma);
        Alert("Empleado creado con éxito");
      }

      if (onGuardado) onGuardado();
      onClose();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado en el sistema.");
      } else {
        setError(error.message || "Error al guardar los datos");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="lg"
      title={empleado ? "Editar empleado" : "Nuevo empleado"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-coral/10 border border-coral/30 text-coral text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <Input
          label="Nombres"
          required
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          error={error.nombre}
          placeholder="Ej: Pedro José"
        />

        <Input
          label="Apellidos"
          required
          value={formData.apellido}
          onChange={(e) =>
            setFormData({ ...formData, apellido: e.target.value })
          }
          error={error.apellido}
          placeholder="Rosales Andrade "
        />

        <Input
          label="Correo"
          type="email"
          required
          value={formData.correo}
          onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          error={error.correo}
          placeholder="empleado@test.com"
        />

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            {empleado ? "Guardar cambios" : "Registrar empleado"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
