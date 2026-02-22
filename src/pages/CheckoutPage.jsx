import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Badge, Alert } from "../components/ui";
import { solicitarCupon } from "../services/cuponesService";
import { useCart } from "../context/CartContext";
import emailjs from "@emailjs/browser";

const CheckoutPage = ({ user }) => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (cart.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-navy/50 mb-4">Tu carrito está vacío.</p>
        <Button onClick={() => navigate("/")}>Ver ofertas</Button>
      </div>
    );
  }

  const total = getTotalPrice();

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

    try {
      // Procesar cada oferta en el carrito
      for (const offer of cart) {
        await solicitarCupon(offer.id, offer.quantity);
        
        // Enviar email para cada oferta
        await emailjs.send(
          "service_mhbzvcs",
          "template_b3g46es",
          {
            user_name: user?.displayName || "Usuario",
            user_email: user?.email,
            offer_title: offer.titulo,
            company_name: offer.empresa?.nombre,
          },
          "bRucC3jMVo9zYDT5b",
        );
      }

      setSuccess("✓ Compra realizada exitosamente");
      
      // Limpiar carrito
      clearCart();
      
      // Redirigir a mis cupones después de 2 segundos
      setTimeout(() => {
        navigate("/my-coupons", { state: { success: true } });
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error al procesar la compra");
      setProcessing(false);
    }
  };

  return (
    <div className="container-app py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Resumen del carrito */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="font-serif text-2xl font-extrabold text-navy mb-6">
            Resumen de tu compra
          </h1>

          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-cream p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Badge variant="cream">{item.empresa?.nombre || item.rubro}</Badge>
                  <h3 className="font-serif font-bold text-lg text-navy mt-2">
                    {item.titulo}
                  </h3>
                </div>
              </div>

              <div className="flex justify-between text-sm text-navy/70 border-t border-cream pt-3">
                <span>Cantidad: <span className="font-semibold">{item.quantity}</span></span>
                <span>Costo: <span className="font-semibold text-teal">${item.costo_cupon}</span> c/u</span>
                <span>Subtotal: <span className="font-bold text-teal">${(item.costo_cupon * item.quantity).toFixed(2)}</span></span>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario de pago */}
        <div className="md:col-span-1">
          <div className="sticky top-24 bg-cream-bg rounded-2xl border border-cream p-6 space-y-5">
            <Badge variant="cream">Pago</Badge>

            <h2 className="font-serif text-2xl font-extrabold text-navy">
              Finalizar
            </h2>

            {/* Resumen totales */}
            <div className="space-y-2 text-navy/70 text-sm border-b border-cream pb-4">
              <div className="flex justify-between">
                <span>Artículos:</span>
                <span className="font-semibold">{cart.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total cupones:</span>
                <span className="font-semibold">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
            </div>

            {/* Total a pagar */}
            <div className="flex justify-between items-center py-3 border-b border-cream">
              <span className="font-semibold text-navy">Total:</span>
              <span className="text-3xl font-black text-teal">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Formulario */}
            <form onSubmit={handlePayment} className="space-y-4">
              {error && <Alert type="error" title="Error" description={error} />}
              {success && <Alert type="success" title="Éxito" description={success} />}

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
                {processing ? "Procesando..." : "Pagar ahora"}
              </Button>

              <Button
                fullWidth
                size="lg"
                variant="ghost"
                type="button"
                onClick={() => navigate("/cart")}
                disabled={processing}
              >
                Volver al carrito
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
