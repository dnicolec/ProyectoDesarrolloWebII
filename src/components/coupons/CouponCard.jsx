import { useNavigate } from "react-router-dom";
import { Badge } from "../ui";

import RestaurantIcon from "../ui/icons/RestaurantIcon";
import VeterinaryIcon from "../ui/icons/VeterinaryIcon";
import EntertainmentIcon from "../ui/icons/EntertainmentIcon";
import ClothingStoreIcon from "../ui/icons/ClothingStoreIcon";

const categoryGradients = {
  restaurant: "from-coral to-[#ffb3ae]",
  veterinary: "from-sage to-[#b8d9c9]",
  entertainment: "from-teal to-[#5fc8c8]",
  clothing: "from-navy to-[#2e5a8a]",
};

const categoryIcons = {
  restaurant: RestaurantIcon,
  veterinary: VeterinaryIcon,
  entertainment: EntertainmentIcon,
  clothing: ClothingStoreIcon,
};

const statusConfig = {
  asignado: { variant: "teal", label: "Disponible" },
  disponible: { variant: "teal", label: "Disponible" },
  canjeado: { variant: "navy", label: "Canjeado" },
  vencido: { variant: "coral", label: "Vencido" },
};

const CouponCard = ({ coupon }) => {
  const navigate = useNavigate();

  const config = statusConfig[coupon.status] || {
    variant: "cream",
    label: coupon.status,
  };

  const daysLeft = coupon.endDate
    ? Math.ceil((new Date(coupon.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const gradient = categoryGradients[coupon.category] || "from-teal to-sage";
  const Icon = categoryIcons[coupon.category] || RestaurantIcon;

  return (
    <div
      onClick={() => navigate(`/my-coupons/${coupon.id}`)}
      className="bg-white rounded-2xl border border-cream overflow-hidden cursor-pointer
                 hover:shadow-lg hover:shadow-navy/[0.06] hover:-translate-y-1.5
                 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                 hover:border-transparent group"
    >
      {/* Image */}
      <div className="relative h-36 sm:h-44 overflow-hidden">
        {coupon.imageUrl ? (
          <img
            src={coupon.imageUrl}
            alt={coupon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <Icon className="text-white/90" />
          </div>
        )}
        <div className="absolute top-3 left-3 ">
          <Badge
            variant={config.variant}
            className="!bg-white/70 !backdrop-blur-sm border-white/30 shadow-sm"
          >
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Ticket divider */}
      <div className="relative h-5">
        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-cream-bg rounded-full" />
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-cream-bg rounded-full" />
        <div
          className="mx-4 h-full flex items-center"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #e8ddd4 0px, #e8ddd4 8px, transparent 8px, transparent 14px)",
            backgroundSize: "100% 2px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* Body */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
        <Badge variant="cream">{coupon.companyName || coupon.category}</Badge>

        <h3 className="font-serif font-bold text-base sm:text-[1.1rem] text-navy mt-1.5 leading-snug line-clamp-2">
          {coupon.title}
        </h3>

        <p className="text-xs sm:text-sm text-navy/50 mt-1 line-clamp-2 leading-relaxed">
          {coupon.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-cream">
          <span className="text-[0.7rem] sm:text-xs text-navy/40">
            {coupon.companyName}
          </span>

          {daysLeft > 0 ? (
            <span className="text-[0.7rem] sm:text-xs font-semibold text-teal">
              {daysLeft} {daysLeft === 1 ? "día" : "días"}
            </span>
          ) : (
            <span className="text-[0.7rem] sm:text-xs font-semibold text-coral">
              Vencido
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponCard;
