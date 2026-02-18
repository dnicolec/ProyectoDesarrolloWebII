import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfferCard from '../components/offers/OfferCard';
import OfferCardLoader from '../components/offers/OfferCardLoader';
import TagIcon from '../components/ui/icons/TagIcon';

// MOCK DATA
const MOCK_CATEGORIES = [
  { id: '1', name: 'Restaurants', label: 'Restaurantes' },
  { id: '2', name: 'Veterinary Clinics', label: 'Veterinarias' },
  { id: '3', name: 'Entertainment', label: 'Entretenimiento' },
  { id: '4', name: 'Clothing Stores', label: 'Tiendas de Ropa' },
];

const MOCK_OFFERS = [
  {
    id: '1',
    title: '2x1 en Plato Fuerte',
    regularPrice: 25.0,
    offerPrice: 12.5,
    startDate: '2025-02-01',
    endDate: '2025-03-15',
    couponDeadline: '2025-03-30',
    couponLimit: 100,
    couponsSold: 37,
    description:
      'Disfruta de un delicioso plato fuerte con acompañante completamente gratis',
    details: 'Válido de lunes a viernes',
    category: 'Restaurantes',
    categoryId: '1',
    companyName: 'Restaurante El Buen Sabor',
    companyAddress: 'Blvd. Los Héroes #123, San Salvador',
    companyPhone: '1111-2222',
    imageUrl: null,
  },
];
//

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setCategories(MOCK_CATEGORIES);
      setOffers(MOCK_OFFERS);
      setLoading(false);
    }, 800);
  }, []);

  const filteredOffers = activeCategory
    ? offers.filter((o) => o.categoryId === activeCategory)
    : offers;

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
              ${
                activeCategory === null
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-navy/50 border-cream hover:border-sage'
              }`}
          >
            Todas
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all
                ${
                  activeCategory === cat.id
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-navy/50 border-cream hover:border-sage'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="container-app pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <OfferCardLoader key={i} />
            ))}
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
            <p className="text-navy/40">
              No hay ofertas disponibles en esta categoría
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;