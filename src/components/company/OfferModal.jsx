import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { crearOferta, actualizarOferta } from '../../services/ofertasService';

const calcularCostoCupon = (precioRegular, descuento, tipo) => {
  const pr = Number(precioRegular);
  const desc = Number(descuento);
  if (!pr || !desc || pr <= 0 || desc <= 0) return null;
  if (tipo === 'porcentaje') return pr * (1 - desc / 100);
  if (tipo === 'monto') return pr - desc;
  return null;
};

export default function OfferModal({ oferta, empresaId, onClose, onGuardado }) {
  const esEdicion = !!oferta;

  const [form, setForm] = useState({
    titulo: '',
    precio_regular: '',
    descuento: '',
    tipo: 'porcentaje',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_limite_cupon: '',
    cantidadCupones: '',
    descripcion: '',
    otros_detalles: '',
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (oferta) {
      setForm({
        titulo: oferta.titulo || '',
        precio_regular: oferta.precio_regular ?? '',
        descuento: oferta.descuento ?? '',
        tipo: oferta.tipo || 'porcentaje',
        fecha_inicio: oferta.fecha_inicio || '',
        fecha_fin: oferta.fecha_fin || '',
        fecha_limite_cupon: oferta.fecha_limite_cupon || '',
        cantidadCupones: oferta.cantidadCupones ?? '',
        descripcion: oferta.descripcion || '',
        otros_detalles: oferta.otros_detalles || '',
      });
    }
  }, [oferta]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrores((prev) => ({ ...prev, [field]: '' }));
  };

  // Costo cupón
  const costoCuponCalculado = calcularCostoCupon(form.precio_regular, form.descuento, form.tipo);

  const validar = () => {
    const e = {};
    if (!form.titulo.trim()) e.titulo = 'Título requerido';
    if (!form.precio_regular || isNaN(Number(form.precio_regular)) || Number(form.precio_regular) <= 0)
      e.precio_regular = 'Precio regular inválido';
    if (!form.descuento || isNaN(Number(form.descuento)) || Number(form.descuento) <= 0)
      e.descuento = 'Descuento inválido';
    if (form.tipo === 'porcentaje' && Number(form.descuento) >= 100)
      e.descuento = 'El porcentaje debe ser menor a 100';
    if (form.tipo === 'monto' && Number(form.descuento) >= Number(form.precio_regular))
      e.descuento = 'El descuento no puede ser mayor o igual al precio regular';
    if (!form.fecha_inicio) e.fecha_inicio = 'Fecha requerida';
    if (!form.fecha_fin) e.fecha_fin = 'Fecha requerida';
    if (form.fecha_fin && form.fecha_inicio && form.fecha_fin < form.fecha_inicio)
      e.fecha_fin = 'Debe ser posterior a la fecha de inicio';
    if (!form.fecha_limite_cupon) e.fecha_limite_cupon = 'Fecha requerida';
    if (!form.descripcion.trim()) e.descripcion = 'Descripción requerida';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }
    setLoading(true);
    setErrorGeneral('');
    try {
      const costo_cupon = calcularCostoCupon(form.precio_regular, form.descuento, form.tipo);
      const datos = {
        titulo: form.titulo.trim(),
        precio_regular: Number(form.precio_regular),
        descuento: Number(form.descuento),
        tipo: form.tipo,
        costo_cupon: Number(costo_cupon.toFixed(2)),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        fecha_limite_cupon: form.fecha_limite_cupon,
        cantidadCupones: form.cantidadCupones !== '' ? Number(form.cantidadCupones) : null,
        descripcion: form.descripcion.trim(),
        otros_detalles: form.otros_detalles.trim(),
      };
      if (esEdicion) {
        await actualizarOferta(oferta.id, { ...datos, estado: 'en_espera' });
      } else {
        await crearOferta(empresaId, datos);
      }
      onGuardado();
    } catch (error) {
      console.error('Error guardando oferta:', error);
      setErrorGeneral('Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="lg"
      title={esEdicion ? 'Editar oferta' : 'Nueva oferta'}>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorGeneral && (
          <div className="bg-coral/10 border border-coral/30 text-coral text-sm rounded-xl px-4 py-3">
            {errorGeneral}
          </div>
        )}

        {/* Aviso si es rechazada */}
        {esEdicion && oferta?.estado === 'rechazada' && (
          <div className="bg-teal/10 border border-teal/20 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-teal mb-0.5">Oferta rechazada</p>
            <p className="text-xs text-navy/60">
              Al guardar, la oferta volverá a{' '}
              <span className="font-medium">en espera de aprobación</span>.
            </p>
            {oferta?.razonRechazo && (
              <p className="text-xs text-navy/50 mt-1.5 border-t border-teal/10 pt-1.5">
                Razón: {oferta.razonRechazo}
              </p>
            )}
          </div>
        )}

        <Input
          label="Título de la oferta"
          required
          value={form.titulo}
          onChange={handleChange('titulo')}
          error={errores.titulo}
          placeholder="Ej: 50% en cena para dos"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Precio regular ($)"
            required
            type="number"
            min="0"
            step="0.01"
            value={form.precio_regular}
            onChange={handleChange('precio_regular')}
            error={errores.precio_regular}
            placeholder="25.00"
          />

          <div>
            <label className="text-sm font-medium text-navy block mb-1.5">
              Tipo de descuento <span className="text-coral ml-0.5">*</span>
            </label>
            <select
              value={form.tipo}
              onChange={handleChange('tipo')}
              className="w-full rounded-xl border-2 border-cream bg-white px-4 py-2.5 text-navy text-[0.9rem]
                transition-all focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20
                hover:border-coral/50"
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto">Monto ($)</option>
            </select>
          </div>
        </div>

        <Input
          label={form.tipo === 'porcentaje' ? 'Descuento (%)' : 'Descuento ($)'}
          required
          type="number"
          min="0"
          step={form.tipo === 'porcentaje' ? '1' : '0.01'}
          value={form.descuento}
          onChange={handleChange('descuento')}
          error={errores.descuento}
          placeholder={form.tipo === 'porcentaje' ? 'Ej: 20' : 'Ej: 5.00'}
        />

        {/*costo cupón calculado*/}
        {costoCuponCalculado !== null && costoCuponCalculado > 0 && (
          <div className="bg-cream-bg border border-cream rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-navy/50">Costo del cupón</p>
            <p className="text-sm font-bold text-coral">${costoCuponCalculado.toFixed(2)}</p>
          </div>
        )}

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Fecha de inicio"
            required
            type="date"
            value={form.fecha_inicio}
            onChange={handleChange('fecha_inicio')}
            error={errores.fecha_inicio}
          />
          <Input
            label="Fecha de fin"
            required
            type="date"
            value={form.fecha_fin}
            onChange={handleChange('fecha_fin')}
            error={errores.fecha_fin}
          />
        </div>

        <Input
          label="Fecha límite para usar el cupón"
          required
          type="date"
          value={form.fecha_limite_cupon}
          onChange={handleChange('fecha_limite_cupon')}
          error={errores.fecha_limite_cupon}
        />

        <Input
          label="Cantidad límite de cupones"
          type="number"
          min="1"
          value={form.cantidadCupones}
          onChange={handleChange('cantidadCupones')}
          error={errores.cantidadCupones}
          placeholder="Dejar vacío si no hay límite"
          hint="Opcional - dejar vacío si no deseas limitar"
        />

        <div>
          <label className="text-sm font-medium text-navy block mb-1.5">
            Descripción <span className="text-coral ml-0.5">*</span>
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => {
              setForm(p => ({ ...p, descripcion: e.target.value }));
              setErrores(p => ({ ...p, descripcion: '' }));
            }}
            rows={3}
            placeholder="Describe la oferta..."
            className={`w-full rounded-xl border-2 bg-white px-4 py-2.5 text-navy text-[0.9rem]
              transition-all focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20
              hover:border-coral/50 resize-none placeholder:text-navy/30
              ${errores.descripcion ? 'border-coral ring-2 ring-coral/20' : 'border-cream'}`}
          />
          {errores.descripcion && <p className="text-sm text-coral mt-1">{errores.descripcion}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-navy block mb-1.5">
            Otros detalles{' '}
            <span className="text-navy/40 font-normal">(opcional)</span>
          </label>
          <textarea
            value={form.otros_detalles}
            onChange={(e) => setForm(p => ({ ...p, otros_detalles: e.target.value }))}
            rows={2}
            placeholder="Condiciones, restricciones, etc."
            className="w-full rounded-xl border-2 border-cream bg-white px-4 py-2.5 text-navy text-[0.9rem]
              transition-all focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20
              hover:border-coral/50 resize-none placeholder:text-navy/30"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button type="submit" fullWidth loading={loading}>
            {esEdicion ? 'Guardar y reenviar' : 'Registrar oferta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}