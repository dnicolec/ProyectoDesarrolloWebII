import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerEmpresaPorId } from '../../services/empresasService';
import { obtenerOfertasPorEmpresa } from '../../services/ofertasService';
import Button from '../../components/ui/Button';

const ESTADOS = [
  { key: 'en_espera',       label: 'En espera de aprobación', color: 'bg-cream text-navy/60' },
  { key: 'aprobada_futura', label: 'Aprobadas futuras',        color: 'bg-teal/10 text-teal' },
  { key: 'aprobada',        label: 'Activas',                  color: 'bg-sage/20 text-sage-dark' },
  { key: 'pasada',          label: 'Pasadas',                  color: 'bg-cream text-navy/40' },
  { key: 'rechazada',       label: 'Rechazadas',               color: 'bg-coral/10 text-coral' },
  { key: 'descartada',      label: 'Descartadas',              color: 'bg-cream text-navy/30' },
];

const clasificarOferta = (oferta) => {
  const ahora = new Date();
  const inicio = oferta.fecha_inicio?.toDate?.() || new Date(oferta.fecha_inicio);
  const fin = oferta.fecha_fin?.toDate?.() || new Date(oferta.fecha_fin);
  if (oferta.estado === 'rechazada') return 'rechazada';
  if (oferta.estado === 'descartada') return 'descartada';
  if (oferta.estado === 'en_espera') return 'en_espera';
  if (oferta.estado === 'aprobada') {
    if (fin < ahora) return 'pasada';
    if (inicio > ahora) return 'aprobada_futura';
    return 'aprobada';
  }
  return 'en_espera';
};

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabActiva, setTabActiva] = useState('aprobada');

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const [emp, ofs] = await Promise.all([
          obtenerEmpresaPorId(id),
          obtenerOfertasPorEmpresa(id),
        ]);
        setEmpresa(emp);
        setOfertas(ofs);
      } catch {
        setError('No se pudo cargar la información de la empresa');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  if (loading) return <div className="py-20 text-center text-sm text-navy/40">Cargando...</div>;
  if (error) return <div className="py-20 text-center text-sm text-coral">{error}</div>;
  if (!empresa) return null;

  const ofertasPorEstado = {};
  ESTADOS.forEach(({ key }) => { ofertasPorEstado[key] = []; });
  ofertas.forEach((o) => {
    const estado = clasificarOferta(o);
    if (ofertasPorEstado[estado]) ofertasPorEstado[estado].push(o);
  });

  const ofertasActuales = ofertasPorEstado[tabActiva] || [];

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/admin/companies')}
        className="flex items-center gap-1.5 text-sm text-navy/50 hover:text-navy transition-colors mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a empresas
      </button>

      <div className="bg-white border border-cream rounded-2xl p-5 mb-5 flex items-start gap-4">
        {empresa.logo ? (
          <img src={empresa.logo} alt={empresa.nombre} className="w-14 h-14 rounded-xl object-contain border border-cream bg-white flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-cream-light border border-cream flex items-center justify-center text-lg font-bold text-navy flex-shrink-0">
            {empresa.nombre?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-serif font-bold text-navy">{empresa.nombre}</h1>
            {empresa.codigo && (
              <span className="text-xs font-mono bg-cream text-navy/60 px-2 py-0.5 rounded-md">{empresa.codigo}</span>
            )}
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${empresa.status === 'activa' ? 'bg-teal/10 text-teal' : 'bg-cream text-navy/40'}`}>
              {empresa.status === 'activa' ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-xs text-navy/50">
            {empresa.email && <span>{empresa.email}</span>}
            {empresa.telefono && <span>{empresa.telefono}</span>}
            {empresa.nombre_contacto && <span>Contacto: {empresa.nombre_contacto}</span>}
            {empresa.porcentaje_comision != null && <span>{empresa.porcentaje_comision}% comisión</span>}
            {empresa.direccion && <span className="col-span-2">{empresa.direccion}</span>}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => {}}>Editar</Button>
      </div>

      <div className="flex gap-1 flex-wrap mb-4">
        {ESTADOS.map(({ key, label, color }) => {
          const count = ofertasPorEstado[key]?.length || 0;
          const isActive = tabActiva === key;
          return (
            <button key={key} onClick={() => setTabActiva(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                ${isActive ? 'border-navy bg-navy text-white' : 'border-cream bg-white text-navy/60 hover:border-navy/30'}`}>
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${isActive ? 'bg-white/20 text-white' : color}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-cream rounded-xl overflow-hidden">
        {ofertasActuales.length === 0 ? (
          <div className="py-14 text-center text-sm text-navy/35">No hay ofertas en este estado</div>
        ) : (
          <div className="divide-y divide-cream">
            {ofertasActuales.map((oferta) => {
              const vendidos = oferta.cuponesGenerados ?? 0;
              const total = oferta.cantidadCupones ?? 0;
              const disponibles = Math.max(0, total - vendidos);
              const ingresos = vendidos * (oferta.costo_cupon ?? 0);
              const comision = empresa.porcentaje_comision != null
                ? (ingresos * empresa.porcentaje_comision) / 100 : null;
              return (
                <div key={oferta.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{oferta.titulo}</p>
                      {oferta.motivo_rechazo && (
                        <p className="text-xs text-coral mt-0.5">Motivo: {oferta.motivo_rechazo}</p>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-teal flex-shrink-0">${oferta.costo_cupon ?? 0}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-0.5 mt-1.5 text-xs text-navy/45">
                    <span>Vendidos: <strong className="text-navy">{vendidos}</strong></span>
                    <span>Disponibles: <strong className="text-navy">{disponibles}</strong></span>
                    <span>Ingresos: <strong className="text-navy">${ingresos.toFixed(2)}</strong></span>
                    {comision != null && (
                      <span>Cargo servicio: <strong className="text-coral">${comision.toFixed(2)}</strong></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
