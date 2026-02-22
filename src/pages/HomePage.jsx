import { useState, useEffect } from 'react';
import OfferCard from '../components/offers/OfferCard';
import OfferCardLoader from '../components/offers/OfferCardLoader';
import SearchIcon from '../components/ui/icons/SearchIcon';
import { obtenerRubros } from '../services/rubrosService';
import { obtenerOfertasAprobadas } from '../services/ofertasService';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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
    const matchesSearch = !searchQuery || 
      offer.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.empresa?.nombre?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && isOfferActive(offer);
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

      {/* Search Bar */}
      <section className="container-app -mt-8 pb-8 relative z-20">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="text-navy/40" size={20} />
            </div>
            <input
              type="text"
              placeholder="Busca ofertas, empresas, categorías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-cream bg-white 
                         text-navy placeholder-navy/40 focus:outline-none focus:border-teal
                         transition-all duration-300 shadow-lg shadow-navy/5
                         hover:border-navy/10 focus:shadow-lg focus:shadow-teal/20"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app pb-4" id="offers">
        <div className="flex flex-wrap gap-3 animate-slide-up">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all
              ${activeCategory === null
                ? 'bg-navy text-white border-navy shadow-md shadow-navy/20'
                : 'bg-white text-navy/50 border-cream hover:border-sage hover:shadow-sm'}`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all
                ${activeCategory === cat.id
                  ? 'bg-navy text-white border-navy shadow-md shadow-navy/20'
                  : 'bg-white text-navy/50 border-cream hover:border-sage hover:shadow-sm'}`}
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