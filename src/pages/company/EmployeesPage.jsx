import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { obtenerEmpresaPorId } from "../../services/empresasService";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmployeeModal from "../../components/company/EmployeeModal";
import { Alert } from "../../components/ui";

export default function EmployeesPage() {
  const { profile } = useAuth();

  const [empresa, setEmpresa] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState(null);
  const [empleadoEliminar, setEmpleadoEliminar] = useState(null);

  // Empresa de acuerdo al empresaId del perfil del usuario autenticado
  const cargarDatos = async () => {
    try {
      const empresaId = profile?.empresaId;
      if (!empresaId) throw new Error("No se encontró la empresa");

      const empData = await obtenerEmpresaPorId(empresaId);
      setEmpresa(empData);

      const qEmployee = query(
        collection(db, "usuarios"),
        where("role", "==", "empleado"),
        where("empresaId", "==", empData.id),
      );
      const snapEmployee = await getDocs(qEmployee);
      setEmpleados(
        snapEmployee.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.empresaId) cargarDatos();
  }, [profile?.empresaId]);

  const handleEliminar = async () => {
    if (!empleadoEliminar) return;
    setLoading(false);
    try {
      const empleadoRef = doc(db, "usuarios", empleadoEliminar.id);
      await updateDoc(empleadoRef, {
        activo: false,
        role: "empleado_inactivo",
      });
      Alert("Empleado desactivado");
      setEmpleadoEliminar(null);
      cargarDatos();
    } catch {
      setError("Error al eliminar empleado");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy">Empleados</h1>
          <p className="text-sm text-navy/45 mt-0.5">
            {empresa ? empresa.nombre : "Cargando empresa..."}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEmpleadoEditar(null);
            setModalOpen(true);
          }}
        >
          + Nuevo empleado
        </Button>
      </div>

      {/* Stats generales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">
            Total empleados
          </p>
          <p className="text-2xl font-bold text-navy">{empleados.length}</p>
        </div>
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">Rol operativo</p>
          <p className="text-2xl font-bold text-teal">Canjeadores</p>
        </div>
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">Empresa</p>
          <p className="text-2xl font-bold text-coral">
            {empresa?.nombre || "-"}
          </p>
        </div>
      </div>

      <div className="bg-white border border-cream rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-cream-bg text-[10px] uppercase tracking-widest text-navy/40 border-b border-cream">
            <tr>
              <th className="px-6 py-3 font-semibold">Nombre Completo</th>
              <th className="px-6 py-3 font-semibold">Correo Electrónico</th>
              <th className="px-6 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream">
            {empleados.map((emp) => (
              <tr key={emp.id} className="hover:bg-cream-bg transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-navy">
                  {emp.nombre} {emp.apellido}
                </td>
                <td className="px-6 py-4 text-sm text-navy/60">{emp.correo}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => {
                      setEmpleadoEditar(emp);
                      setModalOpen(true);
                    }}
                    className="text-teal text-xs font-semibold hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setEmpleadoEliminar(emp)}
                    className="text-coral text-xs font-semibold hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && empresa && (
        <EmployeeModal
          empleado={empleadoEditar}
          empresaId={empresa.id}
          onClose={() => setModalOpen(false)}
          onGuardado={() => {
            setModalOpen(false);
            cargarDatos();
          }}
        />
      )}

      <Modal
        isOpen={!!empleadoEliminar}
        onClose={() => setEmpleadoEliminar(null)}
        size="sm"
      >
        <div className="p-4 text-center">
          <h3 className="text-lg font-bold text-navy mb-2">
            ¿Eliminar a {empleadoEliminar?.nombre}?
          </h3>
          <p className="text-sm text-navy/50 mb-6">
            Esta acción es irreversible y el empleado perderá acceso al sistema.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setEmpleadoEliminar(null)}
            >
              Cancelar
            </Button>
            <Button fullWidth onClick={handleEliminar}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
