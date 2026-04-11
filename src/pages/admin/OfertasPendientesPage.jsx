import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerOfertasPendientes } from '../../services/ofertasService';
import { aprobarOferta, rechazarOferta } from '../../services/estadosOfertaService';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const formatFecha = (f) => {
  if (!f) return '-';
  if (f?.toDate) return f.toDate().toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
  if (typeof f !== 'string') return '-';
  const [year, month, day] = f.split('-');
  return new Date(year, month - 1, day).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatMonto = (n) =>
  n != null ? `$${Number(n).toFixed(2)}` : '-';

export default function OfertasPendientesPage() {
  const { user } = useAuth();
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aprobando, setAprobando] = useState(null);      // id de oferta individual
  const [aprobandoGrupo, setAprobandoGrupo] = useState(null); // empresa_id del grupo
  const [ofertaRechazar, setOfertaRechazar] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [rechazando, setRechazando] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await obtenerOfertasPendientes();
      setOfertas(data);
    } catch {
      setError('Error cargando ofertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleAprobar = async (oferta) => {
    setAprobando(oferta.id);
    try {
      await aprobarOferta(oferta.id, user.uid);
      await cargar();
    } catch {
      setError('Error aprobando oferta');
    } finally {
      setAprobando(null);
    }
  };

  const handleAprobarTodas = async (grupoOfertas, empresaId) => {
    setAprobandoGrupo(empresaId);
    try {
      await Promise.all(grupoOfertas.map((o) => aprobarOferta(o.id, user.uid)));
      await cargar();
    } catch {
      setError('Error aprobando ofertas');
    } finally {
      setAprobandoGrupo(null);
    }
  };

  const handleRechazar = (oferta) => {
    setOfertaRechazar(oferta);
    setMotivo('');
  };

  const confirmarRechazo = async () => {
    if (!motivo.trim()) return;
    setRechazando(true);
    try {
      await rechazarOferta(ofertaRechazar.id, user.uid, motivo.trim());
      setOfertaRechazar(null);
      setMotivo('');
      await cargar();
    } catch {
      setError('Error rechazando oferta');
    } finally {
      setRechazando(false);
    }
  };

  // Agrupar por empresa, luego por título dentro de cada empresa
  const grupos = ofertas.reduce((acc, oferta) => {
    const empKey = oferta.empresa_id;
    if (!acc[empKey]) acc[empKey] = { empresa: oferta.empresa, subgrupos: {} };
    const titKey = oferta.titulo;
    if (!acc[empKey].subgrupos[titKey]) acc[empKey].subgrupos[titKey] = [];
    acc[empKey].subgrupos[titKey].push(oferta);
    return acc;
  }, {});

  const hayAccion = !!aprobando || !!aprobandoGrupo;

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy">Por aprobar</h1>
          <p className="text-sm text-navy/45 mt-0.5">Ofertas enviadas por empresas pendientes de revisión</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="bg-white border border-cream rounded-xl p-4">
          <p className="text-xs text-navy/45 font-medium mb-1">Ofertas pendientes</p>
          <p className="text-2xl font-bold text-navy">{ofertas.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-navy/40">Cargando...</div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-coral">{error}</div>
      ) : ofertas.length === 0 ? (
        <div className="bg-white border border-cream rounded-xl py-16 text-center text-sm text-navy/40">
          No hay ofertas pendientes de aprobación
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(grupos).map(([empresaId, { empresa, subgrupos }]) => {
            const todasLasOfertas = Object.values(subgrupos).flat();
            return (
              <div key={empresaId} className="bg-white border border-cream rounded-xl overflow-hidden">
                {/* Header empresa */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-cream bg-cream-bg/50">
                  <div>
                    <p className="text-sm font-semibold text-navy">{empresa?.nombre || empresaId}</p>
                    <p className="text-xs text-navy/40">
                      {todasLasOfertas.length} oferta{todasLasOfertas.length !== 1 ? 's' : ''} pendiente{todasLasOfertas.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {todasLasOfertas.length > 1 && (
                    <button
                      onClick={() => handleAprobarTodas(todasLasOfertas, empresaId)}
                      disabled={hayAccion}
                      className="text-xs font-semibold text-teal border border-teal/30 rounded-lg px-3 py-1.5 hover:bg-teal/5 transition-colors disabled:opacity-50"
                    >
                      {aprobandoGrupo === empresaId ? 'Aprobando...' : `Aprobar todas (${todasLasOfertas.length})`}
                    </button>
                  )}
                </div>

                {/* Subgrupos por título */}
                <div className="divide-y divide-cream">
                  {Object.entries(subgrupos).map(([titulo, subOfertas]) => {
                    const rep = subOfertas[0];
                    const cantidad = subOfertas.length;
                    const subKey = `${empresaId}-${titulo}`;
                    return (
                      <div key={titulo} className="px-4 py-4 hover:bg-cream-bg transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-navy">{rep.titulo}</p>
                              {cantidad > 1 && (
                                <span className="text-[10px] font-semibold bg-navy/8 text-navy/50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  ×{cantidad}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-navy/30">
                              {formatFecha(rep.fecha_inicio)} – {formatFecha(rep.fecha_fin)}
                              {' · '}Límite canjeo: {formatFecha(rep.fecha_limite_cupon)}
                            </p>
                            {rep.descripcion && (
                              <p className="text-xs text-navy/50 mt-1.5 line-clamp-2">{rep.descripcion}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-navy/30 line-through">{formatMonto(rep.precio_regular)}</p>
                            <p className="text-base font-bold text-coral">{formatMonto(rep.costo_cupon)}</p>
                            {rep.cantidadCupones != null && (
                              <p className="text-[10px] text-navy/40">{rep.cantidadCupones} cupones</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => cantidad > 1 ? handleAprobarTodas(subOfertas, subKey) : handleAprobar(rep)}
                            disabled={hayAccion}
                            className="text-xs font-medium text-teal border border-teal/30 rounded-lg px-3 py-1.5 hover:bg-teal/5 transition-colors disabled:opacity-50"
                          >
                            {(aprobando === rep.id || aprobandoGrupo === subKey)
                              ? 'Aprobando...'
                              : cantidad > 1 ? `Aprobar (${cantidad})` : 'Aprobar'}
                          </button>
                          <button
                            onClick={() => handleRechazar(rep)}
                            disabled={hayAccion}
                            className="text-xs font-medium text-coral border border-coral/30 rounded-lg px-3 py-1.5 hover:bg-coral/5 transition-colors disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!ofertaRechazar} onClose={() => setOfertaRechazar(null)} size="sm" showClose={false}>
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-coral/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-coral">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div>
              <h3 className="font-serif font-bold text-navy text-lg">Rechazar oferta</h3>
              <p className="text-sm text-navy/50 mt-1">"{ofertaRechazar?.titulo}"</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-navy/60 block mb-1">Motivo del rechazo</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explicá el motivo para que la empresa pueda corregir la oferta..."
              rows={3}
              className="w-full text-xs border border-cream rounded-lg px-3 py-2 text-navy placeholder:text-navy/30 focus:outline-none focus:border-coral/50 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setOfertaRechazar(null)} disabled={rechazando}>
            Cancelar
          </Button>
          <Button fullWidth loading={rechazando} onClick={confirmarRechazo} disabled={!motivo.trim()}>
            Rechazar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
