import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Badge } from '../ui';

import RestaurantIcon from '../ui/icons/RestaurantIcon';
import VeterinaryIcon from '../ui/icons/VeterinaryIcon';
import EntertainmentIcon from '../ui/icons/EntertainmentIcon';
import ClothingStoreIcon from '../ui/icons/ClothingStoreIcon';
import CartIcon from '../ui/icons/CartIcon';

const categoryGradients = {
  'restaurant': 'from-coral to-[#ffb3ae]',
  'veterinary':  'from-sage to-[#b8d9c9]',
  'entertainment': 'from-teal to-[#5fc8c8]',
  'clothing':  'from-navy to-[#2e5a8a]',
};

const categoryIcons = {
  'restaurant': RestaurantIcon,
  'veterinary':  VeterinaryIcon,
  'entertainment': EntertainmentIcon,
  'clothing':  ClothingStoreIcon,
};

const OfferCard = ({ offer }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Mostrar costo del cupón si existe, si no mostrar el descuento
  let badgeTexto = '';
  if (offer.costo_cupon && offer.costo_cupon > 0) {
    badgeTexto = `$${offer.costo_cupon}`;
  } else {
    if (offer.tipo === 'porcentaje') {
      badgeTexto = `${offer.descuento}%`;
    } else if (offer.tipo === 'monto') {
      badgeTexto = `$${offer.descuento}`;
    }
  }

  const fechaFin = new Date(offer.fecha_fin?.toDate?.() || offer.fecha_fin);
  const daysLeft = Math.ceil((fechaFin - new Date()) / (1000 * 60 * 60 * 24));

  const gradient = categoryGradients[offer.rubro] || 'from-teal to-sage';
  const Icon = categoryIcons[offer.rubro] || RestaurantIcon;

  // : disponibles = cantidadCupones - cuponesGenerados
  // cuponesGenerados empieza en 0 y sube de 1 en 1 cada vez que alguien toma un cupón
  const generados = offer.cuponesGenerados ?? 0;
  const disponibles = Math.max(0, offer.cantidadCupones - generados);

  const handleAgregarAlCarrito = (e) => {
    e.stopPropagation();
    addToCart(offer, 1);
  };

  return (
    <div
      onClick={() => navigate(`/offer/${offer.id}`)}
      className="relative bg-white rounded-2xl border border-cream overflow-hidden cursor-pointer
                 hover:shadow-xl hover:shadow-navy/[0.08] hover:-translate-y-2
                 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                 hover:border-sage/20 group"
    >
      {/* Image */}
      <div className="relative h-36 sm:h-44 overflow-hidden">
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="text-white/90" />
        </div>
        <div className="absolute top-3 right-3 bg-coral text-white px-2.5 sm:px-3 py-1 rounded-[10px] font-extrabold text-xs sm:text-sm shadow-lg shadow-coral/40">
          {badgeTexto}
        </div>
      </div>

      {/* Ticket divider */}
      <div className="relative h-5">
        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-cream-bg rounded-full" />
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-cream-bg rounded-full" />
        <div
          className="mx-4 h-full flex items-center"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #e8ddd4 0px, #e8ddd4 8px, transparent 8px, transparent 14px)',
            backgroundSize: '100% 2px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Body */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
        <Badge variant="cream">{offer.empresa?.nombre || 'Empresa'}</Badge>

        <h3 className="font-serif font-bold text-base sm:text-[1.1rem] text-navy mt-1.5 leading-snug line-clamp-2">
          {offer.titulo}
        </h3>

        <p className="text-xs sm:text-sm text-navy/50 mt-1 line-clamp-2 leading-relaxed">
          {offer.descripcion}
        </p>

        <div className="text-xs text-navy/60 mt-2">
          {disponibles} cupones disponibles
        </div>

        {offer.costo_cupon && offer.costo_cupon > 0 && (
          <div className="text-xs font-semibold text-teal mt-2">
            ${offer.costo_cupon}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-cream relative">
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] sm:text-xs text-navy/40 truncate">
              {offer.empresa?.nombre || 'Empresa'}
            </span>
            {disponibles > 0 && (
              <button
                onClick={handleAgregarAlCarrito}
                className="bg-teal text-white p-1.5 rounded-full shadow-md shadow-teal/30
                           opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out
                           hover:bg-teal/90 hover:scale-110 active:scale-95"
                title="Agregar 1 cupón al carrito"
              >
                <CartIcon size={16} />
              </button>
            )}
          </div>
          
          <div>
            {daysLeft > 0 ? (
              <span className="text-[0.7rem] sm:text-xs font-semibold text-teal">
                {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
              </span>
            ) : (
              <span className="text-[0.7rem] sm:text-xs font-semibold text-coral">
                Vencida
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCard;