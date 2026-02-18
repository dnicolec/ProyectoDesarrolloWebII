import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Alert } from '../components/ui';

import RestaurantIcon from "../components/ui/icons/RestaurantIcon";
import VeterinaryIcon from "../components/ui/icons/VeterinaryIcon";
import EntertainmentIcon from "../components/ui/icons/EntertainmentIcon";
import ClothingStoreIcon from "../components/ui/icons/ClothingStoreIcon";
import SearchIcon from "../components/ui/icons/SearchIcon";

// MOCK DATA
const MOCK_OFFERS = {
  '1': { id:'1', title:'2x1 Main Dish', regularPrice:25, offerPrice:12.5, startDate:'2025-02-01', endDate:'2025-03-15', couponDeadline:'2025-03-30', couponLimit:100, couponsSold:37, description:'Disfruta de un delicioso plato fuerte con acompañante completamente gratis', details:'Válido de lunes a viernes', category:'Restaurantes', companyName:'El Buen Sabor Restaurant', companyAddress:'Blvd. Los Héroes #123, San Salvador', companyPhone:'1111-2222', imageUrl:null },
};
//

const categoryGradients = {
  'Restaurants': 'from-coral to-[#ffb3ae]',
  'Veterinary Clinics': 'from-sage to-[#b8d9c9]',
  'Entertainment': 'from-teal to-[#5fc8c8]',
  'Clothing Stores': 'from-navy to-[#2e5a8a]',
};

const categoryIcons = {
  'Restaurants': RestaurantIcon,
  'Veterinary Clinics': VeterinaryIcon,
  'Entertainment': EntertainmentIcon,
  'Clothing Stores': ClothingStoreIcon,
};

const OfferDetailPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setTimeout(() => {
      setOffer(MOCK_OFFERS[id] || null);
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) {
    return (
      <div className="container-app py-20 flex justify-center">
        <div className="w-10 h-10 border-[3px] border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container-app py-20 text-center">
        <SearchIcon className="mx-auto text-navy/40 mb-4" size={48} />
        <h2 className="font-serif text-xl sm:text-2xl text-navy/50">
          Offer no encontrada
        </h2>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </Button>
      </div>
    );
  }

  const discount = Math.round(
    ((offer.regularPrice - offer.offerPrice) / offer.regularPrice) * 100
  );

  const availableCoupons = offer.couponLimit
    ? offer.couponLimit - offer.couponsSold
    : null;

  const daysLeft = Math.ceil(
    (new Date(offer.endDate) - new Date()) /
      (1000 * 60 * 60 * 24)
  );

  const savings = (
    offer.regularPrice - offer.offerPrice
  ).toFixed(2);

  const gradient =
    categoryGradients[offer.category] ||
    'from-teal to-sage';

  const Icon =
    categoryIcons[offer.category] ||
    RestaurantIcon;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="container-app py-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left column */}
        <div className="md:col-span-3 space-y-6">
          <div
            className={`relative rounded-2xl overflow-hidden h-72 bg-gradient-to-br ${gradient}`}
          >
            {offer.imageUrl ? (
              <img
                src={offer.imageUrl}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="text-white/80" size={72} />
              </div>
            )}

            <div className="absolute top-4 right-4 bg-coral text-white text-lg font-extrabold px-4 py-2 rounded-xl shadow-lg shadow-coral/40">
              -{discount}%
            </div>
          </div>

          <div>
            <h2 className="font-bold text-navy mb-2">
              Descripción
            </h2>
            <p className="text-navy/60">
              {offer.description}
            </p>
          </div>

          {offer.details && (
            <div>
              <h2 className="font-bold text-navy mb-2">
                Detalles Adicionales
              </h2>
              <p className="text-navy/60">
                {offer.details}
              </p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="md:col-span-2">
          <div className="sticky top-24 bg-cream-bg rounded-2xl border border-cream p-6 space-y-5">
            <Badge variant="cream">
              {offer.category}
            </Badge>

            <h1 className="font-serif text-2xl font-extrabold text-navy">
              {offer.title}
            </h1>

            <div className="text-center">
              <div className="text-3xl font-black text-teal">
                ${offer.offerPrice.toFixed(2)}
              </div>
              <div className="text-sage line-through">
                ${offer.regularPrice.toFixed(2)}
              </div>
              <span className="inline-block bg-coral text-white text-xs font-bold px-3 py-1 rounded-lg mt-2">
                Save ${savings}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  setQuantity(Math.max(1, quantity - 1))
                }
                className="w-10 h-10 rounded-xl border-2 border-cream bg-white"
              >
                −
              </button>

              <span className="text-xl font-bold text-navy">
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity(quantity + 1)
                }
                className="w-10 h-10 rounded-xl border-2 border-cream bg-white"
              >
                +
              </button>
            </div>

            {user ? (
              <Button fullWidth size="lg">
                Buy {quantity > 1 ? `${quantity} coupons` : 'coupon'}
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert type="info">
                  Por favor inicia sesión para comprar cupones
                </Alert>
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Iniciar sesión para comprar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPage;