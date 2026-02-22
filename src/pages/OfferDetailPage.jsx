import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Badge, Alert } from "../components/ui";
import { obtenerOfertaPorId } from "../services/ofertasService";
import { solicitarCupon } from "../services/cuponesService";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import RestaurantIcon from "../components/ui/icons/RestaurantIcon";
import VeterinaryIcon from "../components/ui/icons/VeterinaryIcon";
import EntertainmentIcon from "../components/ui/icons/EntertainmentIcon";
import ClothingStoreIcon from "../components/ui/icons/ClothingStoreIcon";
import SearchIcon from "../components/ui/icons/SearchIcon";
import emailjs from "@emailjs/browser";
import { th } from "zod/locales";

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

// configuración para el envío del correo
const sendEmail = async (nombre, email, title, company) => {
  try {
    const response = await emailjs.send(
      "service_mhbzvcs",
      "template_b3g46es",
      {
        user_name: nombre,
        user_email: email,
        offer_title: title,
        company_name: company,
        reply_to: "non_reply_superduper@gmail.com",
      },
      "bRucC3jMVo9zYDT5b",
    );
    console.log("Correo enviado", response.status, response.text);
  } catch (err) {
    console.log("Error al enviar el correo", err);
  }
};

const OfferDetailPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState("");
  const [yaLoTiene, setYaLoTiene] = useState(false);

  const cargarOferta = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const ofertaData = await obtenerOfertaPorId(id);
      setOffer(ofertaData);

      // Verificar si el usuario ya tiene un cupón de esta oferta
      if (auth.currentUser) {
        const snap = await getDocs(
          query(
            collection(db, "cupones"),
            where("oferta_id", "==", id),
            where("usuario_id", "==", auth.currentUser.uid),
          ),
        );
        setYaLoTiene(!snap.empty);
      }
    } catch (err) {
      console.error("Error cargando oferta:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarOferta();
  }, [cargarOferta]);

  const handleAgregarCupon = async () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    navigate("/checkout", {
      state: {
        offer: {
          id: id,
          title: offer.titulo,
          companyName: offer.empresa?.nombre,
          offerPrice: offer.descuento,
          category: offer.rubro,
        },
        quantity: 1,
      },
    });
  };
  // --- Estados de carga ------------------------------------------------------

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
          Oferta no encontrada
        </h2>
        {error && <p className="text-sm text-coral mt-2">{error}</p>}
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  // --- Cálculo de disponibles ------------------------------------------------
  // : disponibles = cantidadCupones - cuponesGenerados
  // cuponesGenerados = cuántos cupones se han entregado a usuarios
  const generados = offer.cuponesGenerados ?? 0;
  const disponibles = offer.cantidadCupones - generados;

  const descuentoTexto =
    offer.tipo === "porcentaje" ? `${offer.descuento}%` : `$${offer.descuento}`;

  const gradient = categoryGradients[offer.rubro] || "from-teal to-sage";
  const Icon = categoryIcons[offer.rubro] || RestaurantIcon;

  const fechaFin = new Date(offer.fecha_fin?.toDate?.() || offer.fecha_fin);
  const diasRestantes = Math.ceil(
    (fechaFin - new Date()) / (1000 * 60 * 60 * 24),
  );

  const botonDeshabilitado =
    processing || disponibles <= 0 || diasRestantes <= 0 || yaLoTiene;
  const botonTexto = processing
    ? "Procesando..."
    : yaLoTiene
      ? "Ya tienes este cupón"
      : disponibles <= 0
        ? "Sin cupones disponibles"
        : "Agregar Cupón";

  return (
    <div className="container-app py-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left column */}
        <div className="md:col-span-3 space-y-6">
          <div
            className={`relative rounded-2xl overflow-hidden h-72 bg-gradient-to-br ${gradient}`}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="text-white/80" size={72} />
            </div>
            <div className="absolute top-4 right-4 bg-coral text-white text-lg font-extrabold px-4 py-2 rounded-xl shadow-lg shadow-coral/40">
              {descuentoTexto}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-navy mb-2">Descripción</h2>
            <p className="text-navy/60">{offer.descripcion}</p>
          </div>

          <div>
            <h2 className="font-bold text-navy mb-2">
              Información de la Empresa
            </h2>
            <div className="text-navy/60 space-y-1">
              <p>
                <strong>{offer.empresa?.nombre}</strong>
              </p>
              <p>{offer.empresa?.email}</p>
              <p>{offer.empresa?.telefono}</p>
              <p>{offer.empresa?.sitio_web}</p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2">
          <div className="sticky top-24 bg-cream-bg rounded-2xl border border-cream p-6 space-y-5">
            <Badge variant="cream">{offer.empresa?.nombre}</Badge>

            <h1 className="font-serif text-2xl font-extrabold text-navy">
              {offer.titulo}
            </h1>

            <div className="text-center space-y-2">
              <div className="text-3xl font-black text-teal">
                {descuentoTexto}
              </div>
              <span className="inline-block bg-coral text-white text-xs font-bold px-3 py-1 rounded-lg">
                {diasRestantes > 0
                  ? `${diasRestantes} días restantes`
                  : "Vencida"}
              </span>
            </div>

            <div className="bg-navy/5 rounded-lg p-4 text-sm text-navy/70">
              <p className="font-semibold mb-2">Disponibilidad:</p>
              <p>
                {Math.max(0, disponibles)} de {offer.cantidadCupones} cupones
                disponibles
              </p>
            </div>

            {yaLoTiene && (
              <Alert type="info">
                Ya tienes un cupón de esta oferta — revisa Mis Cupones
              </Alert>
            )}
            {error && <Alert type="error" title="Error" description={error} />}
            {success && (
              <Alert type="success" title="Éxito" description={success} />
            )}

            {user ? (
              <Button
                fullWidth
                size="lg"
                onClick={handleAgregarCupon}
                disabled={botonDeshabilitado}
              >
                {botonTexto}
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert type="info">Inicia sesión para agregar cupones</Alert>
                <Button
                  fullWidth
                  size="lg"
                  onClick={() =>
                    navigate("/login", { state: { from: location.pathname } })
                  }
                >
                  Iniciar sesión
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
