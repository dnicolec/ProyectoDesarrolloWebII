import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useState } from "react";
import { Button, Input } from "../../components/ui";
import { auth, db } from "../../lib/firebase";

export default function RedeemCouponsPage() {
  const [couponCode, setCouponCode] = useState("");
  const [customerDui, setCustomerDui] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setCouponData(null);

    try {
      const q = query(
        collection(db, "cupones"),
        where("codigo", "==", couponCode.trim()),
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        throw new Error("El cupón no existe");
      }

      const docData = snap.docs[0].data();
      const id = snap.docs[0].id;

      // empleado actual

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Debes iniciar sesión");

      const empleadoRef = doc(db, "usuarios", currentUser.uid);
      const empleadoSnap = await getDoc(empleadoRef);
      const empleadoData = empleadoSnap.data();

      const ofertaRef = doc(db, "ofertas", docData.oferta_id);
      const ofertaSnap = await getDoc(ofertaRef);

      if (!ofertaSnap.exists()) {
        throw new Error("La oferta de este cupón no está disponible");
      }

      const ofertaData = ofertaSnap.data();

      // comparamos las empresas
      if (empleadoData.empresaId !== ofertaData.empresa_id) {
        throw new Error(
          "No hay un cupón en tu empresa con este código. Error al canjear.",
        );
      }
      if (docData.estado === "canjeado") {
        throw new Error("El cupón ya fue canjeado");
      }

      // verificar el dui del cliente
      const clienteRef = doc(db, "usuarios", docData.usuario_id);
      const clienteSnap = await getDoc(clienteRef);
      const clienteData = clienteSnap.exists() ? clienteSnap.data() : {};

      if (clienteData.dui !== customerDui.trim()) {
        throw new Error(
          "El dui ingresado no coincide con el titular del cupón",
        );
      }
      setCouponData({
        id,
        ...docData,
        oferta_titulo: ofertaData.titulo,
        precio_pagado: docData.costo_cupon || 0,
        nombre_cliente:
          `${clienteData.nombre || ""} ${clienteData.apellido || ""}`.trim() ||
          "Cliente",
        dui_cliente: clienteData.dui || "No registrado",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    setLoading(true);

    try {
      const couponRef = doc(db, "cupones", couponData.id);
      await updateDoc(couponRef, {
        estado: "canjeado",
        canjeadoEn: new Date().toISOString(),
      });

      setSuccess("Cupón canjeado exitosamente.");
      setCouponData(null);
      setCouponCode("");
      setCustomerDui("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-serif font-bold text-navy">
            Canje de cupones
          </h1>
          <p className="text-sm text-navy/45 mt-0.5">
            Validación y verificación de beneficios
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        <section className="bg-white border border-cream rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-navy mb-4 uppercase tracking-wider">
            Verificación de cupones
          </h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-6">
            <Input
              label="Código del cupón"
              placeholder="Ej: ABCD"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              required
            />
            <Input
              label="Dui del cliente"
              placeholder="Ej: 00000000-0"
              value={customerDui}
              onChange={(e) => setCustomerDui(e.target.value)}
              required
            />
            <div className="pt-2">
              <Button fullWidth type="submit" loading={loading && !couponData}>
                Consultar cupón
              </Button>
            </div>
          </form>
        </section>

        {/* Resultados */}

        <div className="space-y-4">
          {error && (
            <div className="bg-coral/10 border border-coral/30 text-coral p-4 rounded-2xl text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-teal/10 border border-teal/30 text-teal p-4 rounded-2xl text-sm font-medium animate-shake">
              {success}
            </div>
          )}

          {couponData && (
            <section className="bg-white border-2 border-teal rounded-2xl overflow-hidden shadow-lg animate-slide-up">
              <div className="bg-teal px-6 py-3 flex justify-between items-center text-white">
                <span className="text-xs font-bold uppercase tracking-widest opacity-90">
                  Cupón Válido
                </span>
                <span className="font-mono font-bold">{couponData.codigo}</span>
              </div>

              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-navy">
                      {couponData.oferta_titulo}
                    </h3>
                    <p className="text-navy/40 text-sm mt-1">
                      Beneficio listo para ser aplicado
                    </p>
                  </div>
                  <p className="text-4xl font-black text-teal">
                    ${parseFloat(couponData.precio_pagado).toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-cream-bg rounded-2xl border border-cream mb-8">
                  <div>
                    <p className="text-[10px] text-navy/40 uppercase font-bold mb-1">
                      Nombre del Cliente
                    </p>
                    <p className="text-base font-semibold text-navy">
                      {couponData.nombre_cliente}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-navy/40 uppercase font-bold mb-1">
                      DUI verificado
                    </p>
                    <p className="text-base font-semibold text-navy">
                      {couponData.dui_cliente}
                    </p>
                  </div>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  onClick={handleRedeem}
                  loading={loading}
                  className="bg-teal hover:bg-teal-dark shadow-teal/20 shadow-lg"
                >
                  Confirmar y Marcar como Canjeado
                </Button>
              </div>
            </section>
          )}

          {!couponData && !error && !success && (
            <div className="py-12 border-2 border-dashed border-cream rounded-2xl flex flex-col items-center justify-center text-navy/20">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mb-3"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-medium">
                Esperando datos de verificación...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
