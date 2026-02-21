import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Badge, Alert } from "../components/ui";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { offer, quantity } = location.state || {};

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (!offer) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-navy/50">No hay información de compra.</p>
      </div>
    );
  }

  const total = offer.offerPrice * quantity;

  const handlePayment = (e) => {
    e.preventDefault();

    if (!cardNumber || !expiry || !cvv) {
      alert("Completa todos los campos.");
      return;
    }

    alert("Compra exitosa. Se envió un correo de confirmación.");
    navigate("/");
  };

  return (
    <div className="container-app py-8">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-cream-bg rounded-2xl border border-cream p-6 space-y-5">

            <Badge variant="cream">
              Checkout
            </Badge>

            <h1 className="font-serif text-2xl font-extrabold text-navy">
              Finalizar compra
            </h1>

            {/* Resumen */}
            <div className="space-y-2 text-navy/70 text-sm border-b border-cream pb-4">
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
                <span>Precio individual</span>
                <span>${offer.offerPrice.toFixed(2)}</span>
            </div>

              <div className="flex justify-between">
                <span>Cantidad</span>
                <span>{quantity}</span>
              </div>

              <div className="flex justify-between font-bold text-navy pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handlePayment} className="space-y-4">

              <div>
                <label className="block text-xs text-navy/50 mb-1">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-xs text-navy/50 mb-1">
                    MM/AA
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="w-1/2">
                  <label className="block text-xs text-navy/50 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full rounded-xl border-2 border-cream bg-white px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <Button fullWidth size="lg" type="submit">
                Pagar ${total.toFixed(2)}
              </Button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;