import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Badge, Alert } from "../components/ui";
import CouponCard from "../components/coupons/CouponCard";
import TagIcon from "../components/ui/icons/TagIcon";

import RestaurantIcon from "../components/ui/icons/RestaurantIcon";
import VeterinaryIcon from "../components/ui/icons/VeterinaryIcon";
import EntertainmentIcon from "../components/ui/icons/EntertainmentIcon";
import ClothingStoreIcon from "../components/ui/icons/ClothingStoreIcon";
import SearchIcon from "../components/ui/icons/SearchIcon";
import jsPDF from "jspdf";
import CouponCardLoader from "../components/coupons/CouponCardLoader";

// MOCK DATA
const MOCK_COUPONS = [
  {
    id: "ASH-1234-1234567",
    title: "2x1 Main Dish",
    status: "disponible",
    buyDate: "2025-03-02",
    couponDeadline: "2025-03-30",
    duiCliente: "12121212-2",
    description:
      "Disfruta de un delicioso plato fuerte con acompañante completamente gratis",
    details: "Válido de lunes a viernes",
    category: "Restaurantes",
    companyName: "El Buen Sabor Restaurant",
    companyAddress: "Blvd. Los Héroes #123, San Salvador",
    companyPhone: "1111-2222",
    imageUrl: null,
  },
  {
    id: "ASH-3456-3456789",
    title: "2x1 pollo frito",
    status: "canjeado",
    buyDate: "2024-03-02",
    couponDeadline: "2024-03-30",
    duiCliente: "24429898-2",
    description: "A las chicas de verdad les gusta el pollo frito",
    details: "Válido de lunes a sábado",
    category: "Restaurantes",
    companyName: "El Buen Sabor Restaurant",
    companyAddress: "Blvd. Los Héroes #123, San Salvador",
    companyPhone: "1111-2222",
    imageUrl: null,
  },
];
//

const categoryGradients = {
  Restaurants: "from-coral to-[#ffb3ae]",
  "Veterinary Clinics": "from-sage to-[#b8d9c9]",
  Entertainment: "from-teal to-[#5fc8c8]",
  "Clothing Stores": "from-navy to-[#2e5a8a]",
};

const categoryIcons = {
  Restaurants: RestaurantIcon,
  "Veterinary Clinics": VeterinaryIcon,
  Entertainment: EntertainmentIcon,
  "Clothing Stores": ClothingStoreIcon,
};

const statusConfig = {
  disponible: { variant: "teal" },
  canjeado: { variant: "navy" },
  vencido: { variant: "coral" },
};

export const MyCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [activeFilter, setActiveFilter] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCoupons(MOCK_COUPONS || []);
      setLoading(false);
    }, 300);
  }, []);

  const filteredCoupons =
    activeFilter === "todos"
      ? coupons
      : coupons.filter((c) => c.status === activeFilter);

  return (
    <div>
      {/* Filtros de estado */}
      <section className="container-app pt-8 pb-4" id="coupons">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter("todos")}
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all
              ${
                activeFilter === "todos"
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy/50 border-cream hover:border-sage"
              }`}
          >
            Todos
          </button>

          {["disponible", "canjeado", "vencido"].map((estado) => (
            <button
              key={estado}
              onClick={() => setActiveFilter(estado)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all
                ${
                  activeFilter === estado
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-navy/50 border-cream hover:border-sage"
                }`}
            >
              {estado}
            </button>
          ))}
        </div>
      </section>

      {/* Coupons */}
      <section className="container-app pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <CouponCardLoader key={i} />
            ))}
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <TagIcon className="mx-auto text-navy/30 mb-4" size={50} />
            <p className="text-navy/40">
              No hay cupones disponibles en este estado
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

const CouponDetailPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const found = MOCK_COUPONS.find((c) => String(c.id) === String(id));
      if (found) {
        setCoupon(found);
      } else {
        setCoupon(null);
      }

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

  if (!coupon) {
    return (
      <div className="container-app py-20 text-center">
        <SearchIcon className="mx-auto text-navy/40 mb-4" size={48} />
        <h2 className="font-serif text-xl sm:text-2xl text-navy/50">
          Cupón no encontrado
        </h2>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  // configuración para estado

  const config = statusConfig[coupon.status] || {
    variant: "cream",
  };

  const daysLeft = Math.ceil(
    (new Date(coupon.couponDeadline) - new Date()) / (1000 * 60 * 60 * 24),
  );

  const savings = (coupon.regularPrice - coupon.couponPrice).toFixed(2);

  const gradient = categoryGradients[coupon.category] || "from-teal to-sage";

  const Icon = categoryIcons[coupon.category] || RestaurantIcon;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Manejo de la descarga del pdf
  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // definimos colores
    const navy = [23, 42, 58];
    const teal = [57, 169, 165];
    const cream = [255, 250, 245];
    const salmon = [255, 160, 145];

    // Construimos pdf
    pdf.setFillColor(cream[0], cream[1], cream[2]);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Encabezado
    pdf.setFillColor(navy[0], navy[1], navy[2]);
    pdf.rect(0, 0, pageWidth, 30, "F");

    pdf.setFontSize(30);
    pdf.setTextColor(salmon[0], salmon[1], salmon[2]);
    pdf.setFont("times", "bold");
    pdf.text("La ", 20, 23);

    const spaceOffset = pdf.getTextWidth("La ");
    pdf.setTextColor(teal[0], teal[1], teal[2]);
    pdf.text("Cuponera", 20 + spaceOffset, 23);
    // Contenido del cupon
    let yPos = 50;

    // titulo del cupon
    pdf.setTextColor(teal[0], teal[1], teal[2]);
    pdf.setFont("times", "bold");
    pdf.setFontSize(28);
    pdf.text(coupon.title, 20, yPos);
    yPos += 15;

    //  información
    pdf.setTextColor(navy[0], navy[1], navy[2]);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.text(`Empresa: ${coupon.companyName}`, 20, yPos);
    yPos += 10;
    pdf.text(`DUI del titular: ${coupon.duiCliente}`, 20, yPos);
    yPos += 20;

    // Código del cupón
    pdf.setDrawColor(teal[0], teal[1], teal[2]);
    pdf.setFillColor(255, 255, 255);
    pdf.setLineWidth(1.5);
    pdf.roundedRect(20, yPos, pageWidth - 40, 40, 5, 5, "FD");

    pdf.setTextColor(teal[0], teal[1], teal[2]);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("CÓDIGO DE CANJE", pageWidth / 2, yPos + 12, { align: "center" });

    pdf.setTextColor(navy[0], navy[1], navy[2]);
    pdf.setFontSize(26);
    pdf.setFont("courier", "bold");
    pdf.text(coupon.id, pageWidth / 2, yPos + 30, { align: "center" });
    yPos += 55;

    // fecha de vencimiento
    pdf.setTextColor(salmon[0], salmon[1], salmon[2]);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(`Válido hasta: ${formatDate(coupon.couponDeadline)}`, 20, yPos);

    // footer
    pdf.setFillColor(navy[0], navy[1], navy[2]);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, "F");
    pdf.setTextColor(cream[0], cream[1], cream[2]);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      "© 2026 La Cuponera. Todos los derechos reservados.",
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" },
    );

    pdf.save(`Coupon_${coupon.id}.pdf`);
  };

  return (
    <div className="container-app py-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left column */}
        <div className="md:col-span-3 space-y-6">
          <div
            className={`relative rounded-2xl overflow-hidden h-72 bg-gradient-to-br ${gradient}`}
          >
            {coupon.imageUrl ? (
              <img
                src={coupon.imageUrl}
                alt={coupon.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="text-white/80" size={72} />
              </div>
            )}
          </div>

          <div>
            <h2 className="font-bold text-navy mb-2">Descripción</h2>
            <p className="text-navy/60">{coupon.description}</p>
          </div>

          {coupon.details && (
            <div>
              <h2 className="font-bold text-navy mb-2">Detalles Adicionales</h2>
              <p className="text-navy/60">{coupon.details}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="md:col-span-2">
          <div className="sticky top-24 bg-cream-bg rounded-2xl border border-cream p-6 space-y-5">
            <Badge variant={config.variant}>{coupon.status}</Badge>

            <h1 className="font-serif text-2xl font-extrabold text-navy">
              {coupon.title}
            </h1>

            <div className="">
              <h2 className="font-bold text-navy mb-2">Código de cupón</h2>
              <div className="text-3xl font-black text-teal tracking-tighter">
                {coupon.id}
              </div>
            </div>

            {coupon.status === "disponible" ? (
              <Button fullWidth size="lg" onClick={handleDownloadPDF}>
                Generar pdf
              </Button>
            ) : (
              <Alert type="warning">
                No puedes utilizar este cupon porque está {coupon.status}
              </Alert>
            )}

            <div className="pt-4 border-t border-cream text-sm text-navy/60">
              <p>
                <strong>DUI del titular:</strong> {coupon.duiCliente}
              </p>
              <p>
                <strong>Fecha de vencimiento:</strong>{" "}
                {formatDate(coupon.couponDeadline)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponDetailPage;
