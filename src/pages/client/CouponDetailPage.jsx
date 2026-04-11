import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { Button, Badge, Alert } from "../../components/ui";
import SearchIcon from "../../components/ui/icons/SearchIcon";
import RestaurantIcon from "../../components/ui/icons/RestaurantIcon";
import VeterinaryIcon from "../../components/ui/icons/VeterinaryIcon";
import EntertainmentIcon from "../../components/ui/icons/EntertainmentIcon";
import ClothingStoreIcon from "../../components/ui/icons/ClothingStoreIcon";
import { obtenerCuponesUsuario } from "../../services/cuponesService";

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
        code: cuponData.codigo,
        status: estadoUI,
        title: cuponData.oferta?.titulo ?? "(Oferta no disponible)",
        description: cuponData.oferta?.descripcion ?? "",
        category: cuponData.oferta?.rubro ?? "restaurant",
        companyName: cuponData.oferta?.empresa?.nombre ?? "N/A",
        imageUrl: cuponData.oferta?.empresa?.logo || null,
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

    // Paleta de colores
    const navy = [23, 42, 58];
    const teal = [57, 169, 165];
    const cream = [252, 250, 242];
    const salmon = [255, 127, 122];
    const lightTeal = [230, 245, 245];

    pdf.setFillColor(cream[0], cream[1], cream[2]);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    pdf.setFillColor(navy[0], navy[1], navy[2]);
    pdf.rect(0, 0, pageWidth, 45, "F");

    pdf.setFontSize(28);
    pdf.setFont("times", "bold");
    const firstPart = "La ";
    const secondPart = "Cuponera";
    const totalWidth = pdf.getTextWidth(firstPart + secondPart);
    const startX = (pageWidth - totalWidth) / 2;

    pdf.setTextColor(salmon[0], salmon[1], salmon[2]);
    pdf.text(firstPart, startX, 28);
    pdf.setTextColor(teal[0], teal[1], teal[2]);
    pdf.text(secondPart, startX + pdf.getTextWidth(firstPart), 28);

    let yPos = 75;

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(230, 230, 230);
    pdf.roundedRect(15, yPos - 12, pageWidth - 30, 145, 3, 3, "FD");

    pdf.setTextColor(navy[0], navy[1], navy[2]);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    const titleLines = pdf.splitTextToSize(coupon.title, pageWidth - 50);
    pdf.text(titleLines, 25, yPos);
    yPos += titleLines.length * 10 + 8;

    pdf.setFontSize(10);
    pdf.setTextColor(140, 140, 140);
    pdf.setFont("helvetica", "normal");
    pdf.text("EMPRESA OFERTANTE", 25, yPos);
    pdf.text("TITULAR DEL CUPÓN (DUI)", pageWidth - 25, yPos, {
      align: "right",
    });

    yPos += 7;
    pdf.setTextColor(navy[0], navy[1], navy[2]);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(coupon.companyName.toUpperCase(), 25, yPos);
    pdf.text(coupon.duiCliente, pageWidth - 25, yPos, { align: "right" });

    yPos += 18;

    pdf.setLineDash([2, 2], 0);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(25, yPos, pageWidth - 25, yPos);
    pdf.setLineDash([], 0);

    yPos += 15;

    const boxWidth = pageWidth - 80;
    const boxX = 40;
    pdf.setFillColor(lightTeal[0], lightTeal[1], lightTeal[2]);
    pdf.roundedRect(boxX, yPos, boxWidth, 38, 4, 4, "F");

    pdf.setTextColor(teal[0], teal[1], teal[2]);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      "PRESENTA ESTE CÓDIGO EN EL ESTABLECIMIENTO",
      pageWidth / 2,
      yPos + 10,
      { align: "center" },
    );

    let fontSizeCodigo = 24;
    const maxTextoWidth = boxWidth - 15;
    pdf.setFont("courier", "bold");
    pdf.setFontSize(fontSizeCodigo);

    while (
      pdf.getTextWidth(coupon.code) > maxTextoWidth &&
      fontSizeCodigo > 7
    ) {
      fontSizeCodigo -= 1;
      pdf.setFontSize(fontSizeCodigo);
    }

    pdf.setTextColor(navy[0], navy[1], navy[2]);

    const yCodePos = yPos + (fontSizeCodigo > 18 ? 27 : 24);
    pdf.text(coupon.code, pageWidth / 2, yCodePos, { align: "center" });

    yPos += 58;

    pdf.setDrawColor(salmon[0], salmon[1], salmon[2]);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth / 2 - 30, yPos - 5, pageWidth / 2 + 30, yPos - 5);

    pdf.setTextColor(salmon[0], salmon[1], salmon[2]);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    const deadlineText = coupon.couponDeadline
      ? `VÁLIDO HASTA: ${formatDate(coupon.couponDeadline).toUpperCase()}`
      : "SIN FECHA DE VENCIMIENTO";
    pdf.text(deadlineText, pageWidth / 2, yPos + 5, { align: "center" });

    pdf.setFillColor(navy[0], navy[1], navy[2]);
    pdf.rect(0, pageHeight - 25, pageWidth, 25, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text(
      "Este cupón es intransferible y requiere DUI original.",
      pageWidth / 2,
      pageHeight - 12,
      { align: "center" },
    );
    pdf.text(
      "Generado por La Cuponera App - 2026",
      pageWidth / 2,
      pageHeight - 7,
      { align: "center" },
    );

    pdf.save(`Cupon_${coupon.code}.pdf`);
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
                  {coupon.code}
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
                  <span className="text-teal font-semibold">
                    ${coupon.costoCupon}
                  </span>
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
