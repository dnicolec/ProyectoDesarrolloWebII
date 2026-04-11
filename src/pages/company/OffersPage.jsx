import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerOfertasPorEmpresa, actualizarOferta} from '../../services/ofertasService';
import { obtenerEmpresaPorId } from '../../services/empresasService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import OfferModal from '../../components/company/OfferModal';

// estados
const ESTADO_CONFIG = {
  en_espera:  { label: 'En espera',        className: 'bg-cream text-navy/60',        dot: 'bg-navy/30'  },
  aprobada:   { label: 'Aprobada',         className: 'bg-teal/10 text-teal',         dot: 'bg-teal'     },
  activa:     { label: 'Activa',           className: 'bg-sage/10 text-sage-dark',    dot: 'bg-sage'     },
  pasada:     { label: 'Pasada',           className: 'bg-cream text-navy/40',        dot: 'bg-navy/20'  },
  rechazada:  { label: 'Rechazada',        className: 'bg-coral/10 text-coral',       dot: 'bg-coral'    },
  descartada: { label: 'Descartada',       className: 'bg-cream text-navy/30',        dot: 'bg-navy/15'  },
};

const TABS = [
  { key: 'en_espera',  label: 'En espera'  },
  { key: 'aprobada',   label: 'Aprobadas'  },
  { key: 'activa',     label: 'Activas'    },
  { key: 'pasada',     label: 'Pasadas'    },
  { key: 'rechazada',  label: 'Rechazadas' },
  { key: 'descartada', label: 'Descartadas'},
];

// Normaliza fecha a string 'YYYY-MM-DD' sin importar si viene como string, Date o Firestore Timestamp
const toDateStr = (f) => {
  if (!f) return null;
  if (typeof f === 'string') return f;
  if (typeof f.toDate === 'function') return f.toDate().toISOString().split('T')[0];
  if (f instanceof Date) return f.toISOString().split('T')[0];
  return String(f);
};

// Estado según fechas
const getEstadoReal = (oferta) => {
  if (['rechazada', 'descartada', 'en_espera'].includes(oferta.estado)) return oferta.estado;
  if (oferta.estado === 'aprobada' || oferta.estado === 'activa') {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date((toDateStr(oferta.fecha_inicio) || '') + 'T00:00:00');
    const fin = new Date((toDateStr(oferta.fecha_fin) || '') + 'T23:59:59');
    if (hoy < inicio) return 'aprobada';
    if (hoy >= inicio && hoy <= fin) return 'activa';
    if (hoy > fin) return 'pasada';
  }
  return oferta.estado;
};

const formatFecha = (f) => {
  const str = toDateStr(f);
  if (!str) return '-';
  const [year, month, day] = str.split('-');
  return new Date(year, month - 1, day).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatMonto = (n) =>
  n != null ? `$${Number(n).toFixed(2)}` : '-';

export default function OffersPage() {
  const { profile } = useAuth();

  const [empresa, setEmpresa] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabActiva, setTabActiva] = useState('en_espera');
  const [modalOpen, setModalOpen] = useState(false);
  const [ofertaEditar, setOfertaEditar] = useState(null);
  const [ofertaDescartar, setOfertaDescartar] = useState(null);
  const [descartando, setDescartando] = useState(false);

  // Empresa de acuerdo al empresaId del perfil del usuario autenticado
  const cargarEmpresa = async () => {
    try {
      const empresaId = profile?.empresaId;
      if (!empresaId) throw new Error('No se encontró empresa para este usuario');
      const emp = await obtenerEmpresaPorId(empresaId);
      setEmpresa(emp);
      return emp;
    } catch (e) {
      setError(e.message);
      return null;
    }
  };

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const emp = await cargarEmpresa();
      if (!emp) return;
      const data = await obtenerOfertasPorEmpresa(emp.id);
      setOfertas(data);
    } catch {
      setError('Error cargando ofertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [profile?.empresaId]);

  // Filtrar por tab con estado real
  const ofertasFiltradas = ofertas.filter((o) => getEstadoReal(o) === tabActiva);

  // Stats por oferta
  const calcularStats = (oferta) => {
    const vendidos = oferta.cuponesGenerados || 0;
    const disponibles = oferta.cantidadCupones != null
      ? Math.max(0, oferta.cantidadCupones - vendidos)
      : '∞';
    const ingresos = vendidos * (oferta.costo_cupon || 0);
    const comision = empresa?.porcentaje_comision
      ? ingresos * (empresa.porcentaje_comision / 100)
      : 0;
    return { vendidos, disponibles, ingresos, comision };
  };

  const handleNueva = () => { setOfertaEditar(null); setModalOpen(true); };
  const handleEditar = (oferta) => { setOfertaEditar(oferta); setModalOpen(true); };
  const handleGuardado = () => { setModalOpen(false); cargar(); };

  const handleDescartar = (oferta) => setOfertaDescartar(oferta);
  const confirmarDescartar = async () => {
    setDescartando(true);
    try {
      await actualizarOferta(ofertaDescartar.id, { estado: 'descartada' });
      setOfertaDescartar(null);
      await cargar();
    } catch {
      setError('Error al descartar la oferta');
    } finally {
      setDescartando(false);
    }
  };

  const conteo = TABS.reduce((acc, tab) => {
    acc[tab.key] = ofertas.filter((o) => getEstadoReal(o) === tab.key).length;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy">Ofertas</h1>
          <p className="text-sm text-navy/45 mt-0.5">
            {empresa ? empresa.nombre : 'Cargando empresa...'}
          </p>
        </div>
        <Button size="sm" onClick={handleNueva}>+ Nueva oferta</Button>
      </div>

      {/* Stats generales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">Total ofertas</p>
          <p className="text-2xl font-bold text-navy">{ofertas.length}</p>
        </div>
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">Activas</p>
          <p className="text-2xl font-bold text-teal">{conteo.activa}</p>
        </div>
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">En espera</p>
          <p className="text-2xl font-bold text-coral">{conteo.en_espera}</p>
        </div>
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">Rechazadas</p>
          <p className="text-2xl font-bold text-navy/40">{conteo.rechazada}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-cream rounded-xl">
        <div className="flex overflow-x-auto border-b border-cream">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTabActiva(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 
                ${tabActiva === tab.key
                  ? 'border-coral text-coral'
                  : 'border-transparent text-navy/45 hover:text-navy'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista de ofertas */}
        {loading ? (
          <div className="py-16 text-center text-sm text-navy/40">Cargando...</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-coral">{error}</div>
        ) : ofertasFiltradas.length === 0 ? (
          <div className="py-16 text-center text-sm text-navy/40">
            No hay ofertas en esta categoría
          </div>
        ) : (
          <div className="divide-y divide-cream">
            {ofertasFiltradas.map((oferta) => {
              const stats = calcularStats(oferta);
              const estadoConf = ESTADO_CONFIG[getEstadoReal(oferta)] || ESTADO_CONFIG.en_espera;
              return (
                <div key={oferta.id} className="px-4 py-4 hover:bg-cream-bg transition-colors">
                  <div className="flex items-start justify-between gap-3">

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-navy truncate">{oferta.titulo}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${estadoConf.className}`}>
                          {estadoConf.label}
                        </span>
                      </div>
                      <p className="text-xs text-navy/40 mb-2">
                        {formatFecha(oferta.fecha_inicio)} - {formatFecha(oferta.fecha_fin)}
                        {' · '}Límite cupón: {formatFecha(oferta.fecha_limite_cupon)}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-cream-bg rounded-lg px-3 py-2">
                          <p className="text-[10px] text-navy/40 mb-0.5">Vendidos</p>
                          <p className="text-sm font-bold text-navy">{stats.vendidos}</p>
                        </div>
                        <div className="bg-cream-bg rounded-lg px-3 py-2">
                          <p className="text-[10px] text-navy/40 mb-0.5">Disponibles</p>
                          <p className="text-sm font-bold text-navy">{stats.disponibles}</p>
                        </div>
                        <div className="bg-cream-bg rounded-lg px-3 py-2">
                          <p className="text-[10px] text-navy/40 mb-0.5">Ingresos</p>
                          <p className="text-sm font-bold text-teal">{formatMonto(stats.ingresos)}</p>
                        </div>
                        <div className="bg-cream-bg rounded-lg px-3 py-2">
                          <p className="text-[10px] text-navy/40 mb-0.5">Cargo servicio</p>
                          <p className="text-sm font-bold text-coral">{formatMonto(stats.comision)}</p>
                        </div>
                      </div>

                      {oferta.estado === 'rechazada' && oferta.razonRechazo && (
                        <div className="mt-2 bg-coral/5 border border-coral/15 rounded-lg px-3 py-2">
                          <p className="text-[10px] font-semibold text-coral mb-0.5">Razón de rechazo</p>
                          <p className="text-xs text-navy/60">{oferta.razonRechazo}</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-navy/30 line-through">{formatMonto(oferta.precio_regular)}</p>
                      <p className="text-base font-bold text-coral">{formatMonto(oferta.costo_cupon)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {oferta.estado === 'rechazada' && (
                      <>
                        <button
                          onClick={() => handleEditar(oferta)}
                          className="text-xs font-medium text-teal border border-teal/30 rounded-lg px-3 py-1.5 hover:bg-teal/5 transition-colors"
                        >
                          Editar y reenviar
                        </button>
                        <button
                          onClick={() => handleDescartar(oferta)}
                          className="text-xs font-medium text-coral border border-coral/30 rounded-lg px-3 py-1.5 hover:bg-coral/5 transition-colors"
                        >
                          Descartar
                        </button>
                      </>
                    )}
                    {oferta.estado === 'en_espera' && (
                      <button
                        onClick={() => handleEditar(oferta)}
                        className="text-xs text-navy/40 hover:text-navy transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && empresa && (
        <OfferModal
          oferta={ofertaEditar}
          empresaId={empresa.id}
          onClose={() => setModalOpen(false)}
          onGuardado={handleGuardado}
        />
      )}

      <Modal isOpen={!!ofertaDescartar} onClose={() => setOfertaDescartar(null)} size="sm" showClose={false}>
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-coral">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <h3 className="font-serif font-bold text-navy text-lg">Descartar oferta</h3>
            <p className="text-sm text-navy/50 mt-1">
              ¿Descartar "{ofertaDescartar?.titulo}"? Ya no podrá ser reenviada para aprobación.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setOfertaDescartar(null)} disabled={descartando}>
            Cancelar
          </Button>
          <Button fullWidth loading={descartando} onClick={confirmarDescartar}>
            Descartar
          </Button>
        </div>
      </Modal>
    </div>
  );
}