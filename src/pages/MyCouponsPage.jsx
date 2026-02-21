import { useState, useEffect, useCallback } from "react";
import { Button, Alert } from "../components/ui";
import CouponCard from "../components/coupons/CouponCard";
import TagIcon from "../components/ui/icons/TagIcon";
import { obtenerCuponesUsuario } from "../services/cuponesService";
import CouponCardLoader from "../components/coupons/CouponCardLoader";

const MyCouponsPage = ({ user }) => {
  const [coupons, setCoupons] = useState([]);
  const [activeFilter, setActiveFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarCupones = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Si todavía no hay sesión, no consultes Firestore
      if (!user?.uid) {
        setCoupons([]);
        return;
      }

      // IMPORTANTE: tu service debe aceptar uid
      const cuponesList = await obtenerCuponesUsuario(user.uid);

      const cuponesFormateados = cuponesList.map((cupon) => {
        const fechaFin = cupon.oferta?.fecha_fin
          ? new Date(cupon.oferta.fecha_fin?.toDate?.() || cupon.oferta.fecha_fin)
          : null;

        let estadoUI = cupon.estado; // 'asignado' | 'canjeado'
        if (cupon.estado === "asignado" && fechaFin && fechaFin < new Date()) {
          estadoUI = "vencido";
        }

        return {
          id: cupon.id,
          status: estadoUI,
          title: cupon.oferta?.titulo ?? "(Oferta no disponible)",
          description: cupon.oferta?.descripcion ?? "",
          category: cupon.oferta?.rubro ?? null,
          companyName: cupon.oferta?.empresa?.nombre ?? "N/A",
          endDate: fechaFin,
          imageUrl: null,
          codigo: cupon.codigo,
          oferta_id: cupon.oferta_id,
          asignadoEn: cupon.asignadoEn,
          canjeadoEn: cupon.canjeadoEn,
        };
      });

      setCoupons(cuponesFormateados);
    } catch (err) {
      console.error("Error cargando cupones:", err);
      setError(err?.message || "Error cargando cupones");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Cargar cuando ya exista user.uid
  useEffect(() => {
    cargarCupones();
  }, [cargarCupones]);

  // Recargar al volver a la pestaña (pero solo si hay usuario)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.uid) cargarCupones();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [cargarCupones, user?.uid]);

  const filteredCoupons =
    activeFilter === "todos"
      ? coupons
      : coupons.filter((c) => c.status === activeFilter);

  const filtros = [
    { key: "asignado", label: "Disponibles" },
    { key: "canjeado", label: "Canjeados" },
    { key: "vencido", label: "Vencidos" },
  ];

  return (
    <div>
      {/* Filtros */}
      <section className="container-app pt-8 pb-4" id="coupons">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter("todos")}
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all
              ${activeFilter === "todos"
                ? "bg-navy text-white border-navy"
                : "bg-white text-navy/50 border-cream hover:border-sage"}`}
          >
            Todos
          </button>

          {filtros.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all
                ${activeFilter === key
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy/50 border-cream hover:border-sage"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Cupones */}
      <section className="container-app pb-16">
        {error && <Alert type="error" title="Error" description={error} />}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => <CouponCardLoader key={i} />)}
          </div>
        ) : !user?.uid ? (
          <div className="text-center py-16 space-y-4">
            <TagIcon className="mx-auto text-navy/30 mb-4" size={50} />
            <p className="text-navy/40">Inicia sesión para ver tus cupones</p>
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <TagIcon className="mx-auto text-navy/30 mb-4" size={50} />
            <p className="text-navy/40">
              {error ? "No se pudieron cargar los cupones" : "No tienes cupones en este estado"}
            </p>
            <Button variant="ghost" size="sm" onClick={cargarCupones} disabled={loading}>
              Actualizar
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyCouponsPage;