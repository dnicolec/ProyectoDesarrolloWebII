import { useState, useEffect } from 'react';
import OfferCard from '../components/offers/OfferCard';
import OfferCardLoader from '../components/offers/OfferCardLoader';
import TagIcon from '../components/ui/icons/TagIcon';
import { obtenerRubros } from '../services/rubrosService';
import { obtenerOfertasAprobadas } from '../services/ofertasService';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [rubros, ofertas] = await Promise.all([
          obtenerRubros(),
          obtenerOfertasAprobadas(),
        ]);

        setCategories(rubros.map((rubro) => ({
          id: rubro.id,
          name: rubro.nombre,
          label: rubro.nombre,
        })));
        setOffers(ofertas);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const isOfferActive = (offer) => {
    const today = new Date();
    const start = new Date(offer.fecha_inicio?.toDate?.() || offer.fecha_inicio);
    const end   = new Date(offer.fecha_fin?.toDate?.()   || offer.fecha_fin);

    const withinDateRange = today >= start && today <= end;
    const isApproved = offer.estado === 'aprobada';

    // Con la nueva lógica:
    // cuponesGenerados = cuántos cupones se han ENTREGADO (empieza en 0)
    // disponibles = cantidadCupones - cuponesGenerados
    const generados = offer.cuponesGenerados ?? 0;
    const disponibles = offer.cantidadCupones - generados;
    const tieneCuponesDisponibles = disponibles > 0;

    return withinDateRange && isApproved && tieneCuponesDisponibles;
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesCategory = !activeCategory || offer.rubro === activeCategory;
    return matchesCategory && isOfferActive(offer);
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-teal-hover text-white py-20 relative overflow-hidden">
        <div className="container-app text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-teal/15 text-teal border border-coral/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            Nuevos descuentos cada semana
          </div>
          <h1 className="font-serif text-5xl font-black leading-tight max-w-3xl mx-auto">
            Descubre{' '}
            <span className="text-coral italic">promociones</span>{' '}
            increíbles
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto">
            Ahorra hasta un 70% en tus establecimientos favoritos
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app pt-8 pb-4" id="offers">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all
              ${activeCategory === null
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-navy/50 border-cream hover:border-sage'}`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all
                ${activeCategory === cat.id
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-navy/50 border-cream hover:border-sage'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="container-app pb-16">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
            Error cargando ofertas: {error}
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => <OfferCardLoader key={i} />)}
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <TagIcon className="mx-auto text-navy/30 mb-4" size={50} />
            <p className="text-navy/40">No hay ofertas disponibles en esta categoría</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;