import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerClientePorId } from "../../services/clientesService";

const TABS = [
  { key: "disponibles", label: "Disponibles" },
  { key: "canjeados", label: "Canjeados" },
  { key: "vencidos", label: "Vencidos" },
];

function formatFecha(ts) {
  if (!ts) return "-";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState("disponibles");

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerClientePorId(id);
        setCliente(data);
      } catch (error) {
        console.error("Error cargando cliente:", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  if (loading) return <div className="py-20 text-center">Cargando...</div>;
  if (!cliente) return <div className="py-20 text-center">Cliente no encontrado</div>;

  const cuponesActuales =
    tabActiva === "disponibles"
      ? cliente.cuponesDisponibles
      : tabActiva === "canjeados"
      ? cliente.cuponesCanjeados
      : cliente.cuponesVencidos;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Botón volver */}
      <button
        onClick={() => navigate("/admin/clientes")}
        className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-4"
      >
        Volver a clientes
      </button>

      {/* Datos personales */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h1 className="text-xl font-bold mb-4">
          {cliente.nombre} {cliente.apellido}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 font-medium">Correo:</span>{" "}
            {cliente.correo}
          </div>
          <div>
            <span className="text-gray-500 font-medium">Teléfono:</span>{" "}
            {cliente.telefono || "-"}
          </div>
          <div>
            <span className="text-gray-500 font-medium">DUI:</span>{" "}
            {cliente.dui || "-"}
          </div>
          <div>
            <span className="text-gray-500 font-medium">Dirección:</span>{" "}
            {cliente.direccion || "-"}
          </div>
        </div>
      </div>

      {/* Resumen de cupones */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Disponibles", count: cliente.cuponesDisponibles?.length ?? 0, color: "bg-teal/10 text-teal border-teal/20"},
          { label: "Canjeados", count: cliente.cuponesCanjeados?.length ?? 0, color: "bg-sage/20 text-sage-dark border-sage/30"},
          { label: "Vencidos", count: cliente.cuponesVencidos?.length ?? 0, color: "bg-coral/10 text-coral border-coral/20"},
        ].map(({ label, count, color }) => (
          <div key={label} className={`border rounded-xl p-4 text-center ${color}`}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs de cupones */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="flex border-b">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTabActiva(tab.key)}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                tabActiva === tab.key
                  ? "border-b-2 border-teal-500 text-teal-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="divide-y">
          {!cuponesActuales || cuponesActuales.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No hay cupones en esta categoría
            </div>
          ) : (
            cuponesActuales.map((cupon) => (
              <div key={cupon.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">
                      {cupon.oferta?.titulo || "Oferta no disponible"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {cupon.oferta?.empresa?.nombre || "Empresa desconocida"}
                    </p>
                    <p className="text-xs font-mono text-gray-400 mt-1">
                      {cupon.codigo}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Comprado: {formatFecha(cupon.createdAt)}</p>
                    {cupon.canjeadoEn && (
                      <p>Canjeado: {formatFecha(cupon.canjeadoEn)}</p>
                    )}
                    {cupon.oferta?.fecha_limite_uso && (
                      <p>Vence: {formatFecha(cupon.oferta.fecha_limite_uso)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}