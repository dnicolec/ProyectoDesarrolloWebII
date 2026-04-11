import { doc, setDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useState } from "react";
import { Modal, Input, Button } from "../../components/ui";

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

  // contraseña default
  const password = import.meta.env.VITE_DEFAULT_PASSWORD;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (empleado?.id) {
        const userRef = doc(db, "usuarios", empleado.id);
        const { password, ...datosEditar } = formData;

        await updateDoc(userRef, datosEditar);

        onGuardado({ id: empleado.id, ...datosEditar });
      } else {
        const nuevoId = doc(collection(db, "usuarios")).id;
        const nuevoDoc = {
          ...formData,
          password: password,
          role: "empleado",
          empresaId: empresaId,
          mustChangePass: true,
          createdAt: new Date().toISOString(),
          dui: "",
          telefono: "",
          direccion: "",
        };
        await setDoc(doc(db, "usuarios", nuevoId), nuevoDoc);

        onGuardado({ id: nuevoId, ...nuevoDoc });
      }
      onClose();
    } catch (error) {
      console.error(error);
      setError("Error al guardar los datos");
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
