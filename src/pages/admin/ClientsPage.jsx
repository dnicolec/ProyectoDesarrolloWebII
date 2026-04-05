import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerClientes } from "../../services/clientesService";

export default function ClientsPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const texto = busqueda.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(texto) ||
      c.apellido?.toLowerCase().includes(texto) ||
      c.correo?.toLowerCase().includes(texto) ||
      c.dui?.includes(texto)
    );
  });

  if (loading) {
    return <div className="py-20 text-center">Cargando clientes...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Clientes registrados</h1>
        <span className="text-sm text-gray-500">{clientes.length} total</span>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por nombre, correo o DUI..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />

      <div className="bg-white border rounded-xl overflow-hidden">
        {clientesFiltrados.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            {busqueda ? "No se encontraron clientes con ese criterio" : "No hay clientes registrados"}
          </div>
        ) : (
          <div className="divide-y">
            {clientesFiltrados.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
                className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                  <p className="text-sm text-gray-500">{cliente.correo}</p>
                  {cliente.dui && (
                    <p className="text-xs text-gray-400">DUI: {cliente.dui}</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}