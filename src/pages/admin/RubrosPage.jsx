import { useState, useEffect } from 'react';
import { obtenerRubros, eliminarRubro } from '../../services/rubrosService';
import Button from '../../components/ui/Button';
import RubroModal from '../../components/admin/RubroModal';
import Modal from "../../components/ui/Modal";
import TagIcon from '../../components/ui/icons/TagIcon';

export default function RubrosPage() {
  const [rubros, setRubros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [rubroEditar, setRubroEditar] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [rubroAEliminar, setRubroAEliminar] = useState(null);

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await obtenerRubros();
      setRubros(data);
    } catch {
      setError('Error cargando rubros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleNuevo = () => { setRubroEditar(null); setModalOpen(true); };
  const handleEditar = (rubro) => { setRubroEditar(rubro); setModalOpen(true); };
  const handleGuardado = () => { setModalOpen(false); cargar(); };

  const handleEliminar = (rubro) => setRubroAEliminar(rubro);

  const confirmarEliminar = async () => {
    setEliminando(rubroAEliminar.id);
    try {
      await eliminarRubro(rubroAEliminar.id);
      setRubroAEliminar(null);
      await cargar();
    } catch {
        setError('Error eliminando rubro');
    } finally {
      setEliminando(null);
    }
  };

  const rubrosFiltrados = rubros.filter((r) =>
    r.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy">Rubros</h1>
          <p className="text-sm text-navy/45 mt-0.5">Categorías de empresas ofertantes</p>
        </div>
        <Button size="sm" onClick={handleNuevo}>+ Nuevo rubro</Button>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
         <div className="bg-white border border-cream rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-navy/45 font-medium mb-1">Total rubros registrados</p>
            <p className="text-2xl font-bold text-navy">{rubros.length}</p>
          </div> 
        </div>
      </div>

      <div className="bg-white border border-cream rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cream gap-3">
          <p className="text-sm font-semibold text-navy">Todos los rubros</p>
          <input
            type="text"
            placeholder="Buscar rubro..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="text-xs border border-cream rounded-lg px-3 py-1.5 text-navy placeholder:text-navy/30 
                       focus:outline-none focus:border-coral/50 w-48 sm:w-64"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-navy/40">Cargando...</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-coral">{error}</div>
        ) : rubrosFiltrados.length === 0 ? (
          <div className="py-16 text-center text-sm text-navy/40">
            {busqueda ? 'Sin resultados para esa búsqueda' : 'No hay rubros registrados'}
          </div>
        ) : (
          <div className="divide-y divide-cream">
            {rubrosFiltrados.map((rubro) => (
              <div key={rubro.id} className="flex items-center gap-3 px-4 py-3 hover:bg-cream-bg transition-colors">

                <div className="w-9 h-9 rounded-lg bg-coral/10 border border-coral/20 flex items-center justify-center flex-shrink-0">
                    <TagIcon size={24} className="text-coral" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy truncate">{rubro.nombre}</p>
                  {rubro.descripcion && (
                    <p className="text-xs text-navy/40 truncate">{rubro.descripcion}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditar(rubro)}
                    className="text-xs text-navy/40 hover:text-navy transition-colors"
                  >
                    Editar
                  </button>
                  <span className="text-cream">|</span>
                  <button
                    onClick={() => handleEliminar(rubro)}
                    disabled={eliminando === rubro.id}
                    className="text-xs text-coral font-medium hover:text-coral/70 transition-colors disabled:opacity-50"
                  >
                    {eliminando === rubro.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <RubroModal
          rubro={rubroEditar}
          onClose={() => setModalOpen(false)}
          onGuardado={handleGuardado}
        />
      )}

      <Modal isOpen={!!rubroAEliminar} onClose={() => setRubroAEliminar(null)} size="sm" showClose={false}>
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-coral">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <div>
            <h3 className="font-serif font-bold text-navy text-lg">Eliminar rubro</h3>
            <p className="text-sm text-navy/50 mt-1">
              ¿Eliminar "{rubroAEliminar?.nombre}"? Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setRubroAEliminar(null)} disabled={!!eliminando}>
            Cancelar
          </Button>
          <Button fullWidth loading={!!eliminando} onClick={confirmarEliminar}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}