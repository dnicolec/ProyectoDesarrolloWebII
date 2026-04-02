import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerEmpresas } from '../../services/empresasService';
import { obtenerRubros } from '../../services/rubrosService';
import Button from '../../components/ui/Button';
import CompanyModal from '../../components/admin/CompanyModal';

const statusConfig = {
  activa:   { label: 'Activa',   className: 'bg-teal/10 text-teal' },
  inactiva: { label: 'Inactiva', className: 'bg-cream text-navy/50' },
};

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaEditar, setEmpresaEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      const [emps, rubs] = await Promise.all([obtenerEmpresas(), obtenerRubros()]);
      setEmpresas(emps);
      setRubros(rubs);
    } catch {
      setError('Error cargando empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const empresasFiltradas = empresas.filter((e) =>
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.codigo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalActivas = empresas.filter((e) => e.status === 'activa').length;

  const getNombreRubro = (rubroId) => {
    const r = rubros.find((r) => r.id === rubroId);
    return r?.nombre || rubroId || '—';
  };

  const handleNueva = () => { setEmpresaEditar(null); setModalOpen(true); };
  const handleEditar = (empresa) => { setEmpresaEditar(empresa); setModalOpen(true); };
  const handleGuardado = () => { setModalOpen(false); cargar(); };

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy">Empresas</h1>
          <p className="text-sm text-navy/45 mt-0.5">Gestión de empresas ofertantes registradas</p>
        </div>
        <Button size="sm" onClick={handleNueva}>+ Nueva empresa</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">Total empresas</p>
          <p className="text-2xl font-bold text-navy">{empresas.length}</p>
        </div>
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">Activas</p>
          <p className="text-2xl font-bold text-teal">{totalActivas}</p>
        </div>
        <div className="bg-white border border-cream rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-navy/45 font-medium mb-1">Rubros registrados</p>
          <p className="text-2xl font-bold text-coral">{rubros.length}</p>
        </div>
      </div>

      <div className="bg-white border border-cream rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cream gap-3">
          <p className="text-sm font-semibold text-navy">Todas las empresas</p>
          <input
            type="text"
            placeholder="Buscar por nombre, código o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="text-xs border border-cream rounded-lg px-3 py-1.5 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral/50 w-48 sm:w-64"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-navy/40">Cargando...</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-coral">{error}</div>
        ) : empresasFiltradas.length === 0 ? (
          <div className="py-16 text-center text-sm text-navy/40">
            {busqueda ? 'Sin resultados para esa búsqueda' : 'No hay empresas registradas'}
          </div>
        ) : (
          <div className="divide-y divide-cream">
            {empresasFiltradas.map((empresa) => {
              const status = statusConfig[empresa.status] || statusConfig.activa;
              const initials = empresa.nombre?.slice(0, 2).toUpperCase() || '??';
              return (
                <div key={empresa.id} className="flex items-center gap-3 px-4 py-3 hover:bg-cream-bg transition-colors">
                  {empresa.logo ? (
                    <img src={empresa.logo} alt={empresa.nombre}
                      className="w-9 h-9 rounded-lg object-contain border border-cream bg-white flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  ) : null}
                  <div className="w-9 h-9 rounded-lg bg-cream-light border border-cream flex items-center justify-center text-xs font-bold text-navy flex-shrink-0"
                    style={{ display: empresa.logo ? 'none' : 'flex' }}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{empresa.nombre}</p>
                    <p className="text-xs text-navy/40 truncate">
                      {empresa.codigo ? `${empresa.codigo} · ` : ''}
                      {getNombreRubro(empresa.rubro)}
                      {empresa.porcentaje_comision ? ` · ${empresa.porcentaje_comision}% comisión` : ''}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${status.className}`}>
                    {status.label}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleEditar(empresa)} className="text-xs text-navy/40 hover:text-navy transition-colors">Editar</button>
                    <span className="text-cream">|</span>
                    <button onClick={() => navigate(`/admin/companies/${empresa.id}`)} className="text-xs text-teal font-medium hover:text-teal-hover transition-colors">Ver detalle</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <CompanyModal empresa={empresaEditar} rubros={rubros} onClose={() => setModalOpen(false)} onGuardado={handleGuardado} />
      )}
    </div>
  );
}
