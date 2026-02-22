import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Badge, Alert } from "../components/ui";
import { solicitarCupon } from "../services/cuponesService";
import emailjs from "@emailjs/browser";
import { success } from "zod";

const CheckoutPage = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { offer, quantity } = location.state || {};

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!offer) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-navy/50">No hay información de compra.</p>
        <Button onClick={() => navigate("/")}>Ver ofertas</Button>
      </div>
    ); 
  } 

  //const total = offer.offerPrice * quantity;

  const discountData = offer.tipo === "porcentaje" ?`${offer.descuento}%` 
  : `$${offer.descuento}`;

  const handlePayment = async (e) => {
    e.preventDefault();

    const digitsOnly = cardNumber.replace(/\s/g, "");

    const cardNumberPattern = /^\d{16}$/;
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/; 
    const cvvPattern = /^\d{3}$/; 

    if (!cardNumberPattern.test(digitsOnly)) {
      alert("Ingresa un número de tarjeta válido de 16 dígitos.");
      return;
    }
    if (!expiryPattern.test(expiry)) {
      alert("Ingresa la fecha de expiración en formato MM/AA.");
      return;
    }
    if (!cvvPattern.test(cvv)) {
      alert("Ingresa un CVV válido de 3 dígitos.");
      return;
    }

    setProcessing(true);
    setError("");

    // logica para envio de correo
    try{
      await solicitarCupon(offer.id);
      await emailjs.send(
        "service_mhbzvcs",
        "template_b3g46es",
        {
          user_name: user?.displayName || "Usuario",
          user_email: user?.email,
          offer_title: offer.title,
          company_name: offer.company,
        },
        "bRucC3jMVo9zYDT5b",
      );

      navigate("/my-coupons", { state: { success: true } });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error al agregar cupón");
      setProcessing(false);
    }
  };

  return (
    <div className="container-app py-8">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-cream-bg rounded-2xl border border-cream p-6 space-y-5">
            <Badge variant="cream">Checkout</Badge>

            <h1 className="font-serif text-2xl font-extrabold text-navy">
              Finalizar compra
            </h1>

            {/* Resumen de la oferta */}
            <div className="space-y-2 text-navy/70 text-sm border-b border-cream pb-4">
              <div className="flex justify-between">
                <span>Descuento</span>
                <span>{discountData}</span>
              </div>
              <div className="flex justify-between">
                <span>Categoría</span>
                <span>{offer.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Tienda</span>
                <span className="text-right">{offer.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span>Oferta</span>
                <span className="text-right">{offer.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Descripción</span>
                <span className="text-right text-[#f07a73]">{offer.descripcion}</span>
              </div>
 

              {/*<div className="flex justify-between font-bold text-navy pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div> */}
            </div>

            {/* Formulario */}
            <form onSubmit={handlePayment} className="space-y-4">
              {error && <Alert type="error" title="Error" description={error} />}

              <div>
                <label className="block text-xs text-navy/50 mb-1">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  placeholder="1234 1234 1234 1234"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                    setCardNumber(formatted);
                  }}
                  className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-xs text-navy/50 mb-1">MM/AA</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) =>
                      setExpiry(
                        e.target.value
                          .replace(/[^\d]/g, "")
                          .replace(/^(\d{2})(\d)/, "$1/$2")
                      )
                    }
                    className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2 focus:outline-none"
                    required
                  />
                </div>

                <div className="w-1/2">
                  <label className="block text-xs text-navy/50 mb-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={3}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <Button fullWidth size="lg" type="submit" disabled={processing}>
                {processing ? "Procesando..." : "Pagar"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
