import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Button, Badge, Alert } from "../../components/ui";
import { solicitarCupon } from "../../services/cuponesService";
import { useCart } from "../../context/CartContext";
import emailjs from "@emailjs/browser";

const CheckoutPage = ({ user }) => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState([]);

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
      for (const item of cart) {
        await solicitarCupon(item.id, item.quantity);
      }

      const detalleProductos = cart
        .map((item, index) => {
          const subtotal = (item.costo_cupon * item.quantity).toFixed(2);
          const empresaNombre =
            item.empresa?.nombre || item.rubro || "La Cuponera";
          return `Producto ${index + 1}: ${item.titulo.toUpperCase()} 
            Empresa: ${empresaNombre}
            Cantidad: ${item.quantity} unidades
            Subtotal: $${subtotal}
            --------------------------`;
        })
        .join("\n\n");

      // Enviar email para cada oferta
      await emailjs.send(
        "service_mhbzvcs",
        "template_b3g46es",
        {
          user_name: user?.displayName,
          user_email: user?.email,
          offer_title: "Compra de La Cuponera",
          company_name: "La Cuponera",
          productos_detalle: detalleProductos,
        },
        "bRucC3jMVo9zYDT5b",
      );

      // Guardar items antes de limpiar el carrito
      setPurchasedItems([...cart]);
      clearCart();
      setPurchased(true);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error al procesar la compra");
      setProcessing(false);
    }
  };

  if (cart.length === 0 && !purchased) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-navy/50 mb-4">Tu carrito está vacío.</p>
        <Button onClick={() => navigate("/")}>Ver ofertas</Button>
      </div>
    );
  }

  if (purchased) {
    const totalPagado = purchasedItems.reduce(
      (acc, item) => acc + item.costo_cupon * item.quantity, 0
    );

    return (
      <div className="container-app py-16 max-w-lg mx-auto text-center space-y-6">
        {/* Icono de éxito */}
        <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div>
          <h1 className="font-serif text-3xl font-extrabold text-navy">
            ¡Compra realizada!
          </h1>
          <p className="text-navy/55 mt-2 text-sm">
            Tu pago fue procesado exitosamente. Ya puedes usar tus cupones.
          </p>
        </div>

        {/* Resumen de lo comprado */}
        <div className="bg-white border border-cream rounded-2xl p-5 text-left space-y-3">
          {purchasedItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold text-navy">{item.titulo}</p>
                <p className="text-navy/45 text-xs">
                  {item.empresa?.nombre || item.rubro} · {item.quantity} cupón{item.quantity > 1 ? 'es' : ''}
                </p>
              </div>
              <span className="font-bold text-teal">
                ${(item.costo_cupon * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t border-cream pt-3 flex justify-between text-sm font-semibold text-navy">
            <span>Total pagado</span>
            <span className="text-teal text-base">${totalPagado.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-xs text-navy/40">
          Recibirás un correo de confirmación en <strong>{user?.email}</strong>
        </p>

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <Link to="/my-coupons">
            <Button fullWidth size="lg">
              Ver mis cupones
            </Button>
          </Link>
          <Button fullWidth size="lg" variant="ghost" onClick={() => navigate("/")}>
            Seguir comprando
          </Button>
        </div>
      </div>
    );
  }

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
                  <Badge variant="cream">
                    {item.empresa?.nombre || item.rubro}
                  </Badge>
                  <h3 className="font-serif font-bold text-lg text-navy mt-2">
                    {item.titulo}
                  </h3>
                </div>
              </div>

              <div className="flex justify-between text-sm text-navy/70 border-t border-cream pt-3">
                <span>
                  Cantidad:{" "}
                  <span className="font-semibold">{item.quantity}</span>
                </span>
                <span>
                  Costo:{" "}
                  <span className="font-semibold text-teal">
                    ${item.costo_cupon}
                  </span>{" "}
                  c/u
                </span>
                <span>
                  Subtotal:{" "}
                  <span className="font-bold text-teal">
                    ${(item.costo_cupon * item.quantity).toFixed(2)}
                  </span>
                </span>
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
              {error && (
                <Alert type="error" title="Error" description={error} />
              )}

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
                  <label className="block text-xs text-navy/50 mb-1">
                    MM/AA
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) =>
                      setExpiry(
                        e.target.value
                          .replace(/[^\d]/g, "")
                          .replace(/^(\d{2})(\d)/, "$1/$2"),
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
