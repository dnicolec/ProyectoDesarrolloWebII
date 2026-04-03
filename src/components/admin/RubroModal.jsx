import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { crearRubro, actualizarRubro } from '../../services/rubrosService';

export default function RubroModal({ rubro, onClose, onGuardado }) {
  const esEdicion = !!rubro;
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (rubro) {
      setNombre(rubro.nombre || '');
      setDescripcion(rubro.descripcion || '');
    }
  }, [rubro]);

  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre es requerido';
    else if (nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }
    setLoading(true);
    setErrorGeneral('');
    try {
      const datos = { nombre: nombre.trim(), descripcion: descripcion.trim() };
      if (esEdicion) await actualizarRubro(rubro.id, datos);
      else await crearRubro(datos);
      onGuardado();
    } catch{
      setErrorGeneral('Ocurrió un error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-cream w-full max-w-md shadow-xl animate-slide-up">

        <div className="flex items-center justify-between px-6 py-4 border-b border-cream">
          <h2 className="font-serif font-bold text-navy text-lg">
            {esEdicion ? 'Editar rubro' : 'Nuevo rubro'}
          </h2>
          <button onClick={onClose} className="text-navy/40 hover:text-navy transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {errorGeneral && (
            <div className="bg-coral/10 border border-coral/30 text-coral text-sm rounded-xl px-4 py-3">
              {errorGeneral}
            </div>
          )}

          <Input
            label="Nombre del rubro"
            required
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); setErrores({}); }}
            error={errores.nombre}
            placeholder="Ej: Restaurantes, Talleres, Entretenimiento"
          />

          <div>
            <label className="text-sm font-medium text-navy block mb-1.5">
              Descripción <span className="text-navy/40 font-normal">(opcional)</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción breve del rubro..."
              rows={3}
              className="w-full rounded-xl border-2 border-cream bg-white px-4 py-2.5 text-navy text-[0.9rem] 
                         transition-all focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20
                         hover:border-coral/50 resize-none placeholder:text-navy/30"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
            <Button type="submit" fullWidth loading={loading}>
              {esEdicion ? 'Guardar cambios' : 'Crear rubro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}