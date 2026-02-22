import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { Button, Badge, Alert } from "../components/ui";
import SearchIcon from "../components/ui/icons/SearchIcon";
import RestaurantIcon from "../components/ui/icons/RestaurantIcon";
import VeterinaryIcon from "../components/ui/icons/VeterinaryIcon";
import EntertainmentIcon from "../components/ui/icons/EntertainmentIcon";
import ClothingStoreIcon from "../components/ui/icons/ClothingStoreIcon";
import { obtenerCuponesUsuario } from "../services/cuponesService";
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
  asignado: { variant: "teal", label: "Disponible" },
  disponible: { variant: "teal", label: "Disponible" },
  canjeado: { variant: "navy", label: "Canjeado" },
  vencido: { variant: "coral", label: "Vencido" },
};

const CouponDetailPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarCupon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cuponesList = await obtenerCuponesUsuario(auth.currentUser.uid);
      const cuponData = cuponesList.find((c) => String(c.id) === String(id));

      if (!cuponData) {
        throw new Error("Cupón no encontrado.");
      }

      // dui del usuario
      let duiUsuario = "Dui no registrado";
      try {
        const userRef = doc(db, "usuarios", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().dui) {
          duiUsuario = userSnap.data().dui;
        }
      } catch (errProfile) {
        console.error("No se pudo obtener el perfil del usuario:", errProfile);
      }

      const fechaFinRaw = cuponData.oferta?.fecha_fin;
      const fechaFin = fechaFinRaw
        ? new Date(fechaFinRaw?.toDate?.() || fechaFinRaw)
        : null;

      let estadoUI = cuponData.estado;
      if (
        cuponData.estado === "asignado" &&
        fechaFin &&
        fechaFin < new Date()
      ) {
        estadoUI = "vencido";
      }

      setCoupon({
        id: cuponData.id,
        status: estadoUI,
        title: cuponData.oferta?.titulo ?? "(Oferta no disponible)",
        description: cuponData.oferta?.descripcion ?? "",
        category: cuponData.oferta?.rubro ?? "Restaurants",
        companyName: cuponData.oferta?.empresa?.nombre ?? "N/A",
        duiCliente: cuponData.duiCliente || duiUsuario,
        couponDeadline: fechaFin,
        costoCupon: cuponData.costo_cupon ?? 0,
      });
    } catch (err) {
      console.error("Error cargando el detalle del cupón:", err);
      setError(err.message);
      setCoupon(null);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (auth.currentUser) {
      cargarCupon();
    }
  }, [cargarCupon]);

  if (loading) {
    return (
      <div className="container-app py-20 flex justify-center">
        <div className="w-10 h-10 border-[3px] border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coupon || error) {
    return (
      <div className="container-app py-20 text-center">
        <SearchIcon className="mx-auto text-navy/40 mb-4" size={48} />
        <h2 className="font-serif text-xl sm:text-2xl text-navy/50">
          {error ? error : "Cupón no encontrado"}
        </h2>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  const config = statusConfig[coupon.status] || {
    variant: "cream",
    label: coupon.status,
  };
  const daysLeft = Math.ceil(
    (new Date(coupon.couponDeadline) - new Date()) / (1000 * 60 * 60 * 24),
  );
  const gradient = categoryGradients[coupon.category] || "from-teal to-sage";
  const Icon = categoryIcons[coupon.category] || RestaurantIcon;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const navy = [23, 42, 58];
    const teal = [57, 169, 165];
    const cream = [255, 250, 245];
    const salmon = [255, 160, 145];

    pdf.setFillColor(cream[0], cream[1], cream[2]);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    pdf.setFillColor(navy[0], navy[1], navy[2]);
    pdf.rect(0, 0, pageWidth, 30, "F");

    pdf.setFontSize(30);
    pdf.setFont("times", "bold");
    const firstPart = "La ";
    const secondPart = "Cuponera";
    const totalWidth = pdf.getTextWidth(firstPart + secondPart);
    const startX = (pageWidth - totalWidth) / 2;

    pdf.setTextColor(salmon[0], salmon[1], salmon[2]);
    pdf.text(firstPart, startX, 23);

    const offset = pdf.getTextWidth(firstPart);
    pdf.setTextColor(teal[0], teal[1], teal[2]);
    pdf.text(secondPart, startX + offset, 23);

    let yPos = 50;

    pdf.setTextColor(teal[0], teal[1], teal[2]);
    pdf.setFontSize(28);
    pdf.text(coupon.title, 20, yPos);
    yPos += 15;

    pdf.setTextColor(navy[0], navy[1], navy[2]);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.text(`Empresa: ${coupon.companyName}`, 20, yPos);
    yPos += 10;
    pdf.text(`DUI del titular: ${coupon.duiCliente}`, 20, yPos);
    yPos += 20;

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

    pdf.setTextColor(salmon[0], salmon[1], salmon[2]);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    if (coupon.couponDeadline) {
      pdf.text(`Válido hasta: ${formatDate(coupon.couponDeadline)}`, 20, yPos);
    } else {
      pdf.text(`Válido hasta: N/A`, 20, yPos);
    }

    pdf.setFillColor(navy[0], navy[1], navy[2]);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, "F");
    pdf.setTextColor(cream[0], cream[1], cream[2]);
    pdf.setFontSize(10);
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

        <div className="md:col-span-2">
          <div className="sticky top-24 bg-cream-bg rounded-2xl border border-cream p-6 space-y-5">
            <Badge variant={config.variant}>{config.label}</Badge>

            <h1 className="font-serif text-2xl font-extrabold text-navy">
              {coupon.title}
            </h1>

            <div>
              <h2 className="font-bold text-navy mb-2">Código de cupón</h2>{" "}
              {coupon.status === "asignado" ||
              coupon.status === "disponibles" ? (
                <div className="text-3xl font-black text-teal tracking-tighter">
                  {coupon.id}
                </div>
              ) : (
                <div className="text-3xl font-black text-teal tracking-tighter">
                  ***
                </div>
              )}
            </div>

            {coupon.status === "asignado" ? (
              <Button fullWidth size="lg" onClick={handleDownloadPDF}>
                Generar pdf
              </Button>
            ) : (
              <Alert type="warning">
                No puedes utilizar este cupon porque está {coupon.status}
              </Alert>
            )}

            <div className="pt-4 border-t border-cream text-sm text-navy/60 space-y-3">
              <p>
                <strong>DUI del titular:</strong> {coupon.duiCliente}
              </p>
              <p>
                <strong>Fecha de vencimiento:</strong>{" "}
                {coupon.couponDeadline
                  ? formatDate(coupon.couponDeadline)
                  : "N/A"}
              </p>
              {coupon.costoCupon !== undefined && coupon.costoCupon > 0 && (
                <p>
                  <strong>Costo del cupón:</strong>{" "}
                  <span className="text-teal font-semibold">${coupon.costoCupon}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponDetailPage;
