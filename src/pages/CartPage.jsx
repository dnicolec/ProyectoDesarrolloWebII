import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Button, Badge, Alert } from "../components/ui";
import SearchIcon from "../components/ui/icons/SearchIcon";

const CartPage = ({ user }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();

  if (cart.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <SearchIcon className="mx-auto text-navy/40 mb-4" size={48} />
        <h2 className="font-serif text-xl sm:text-2xl text-navy/50 mb-4">
          Tu carrito está vacío
        </h2>
        <Button onClick={() => navigate("/")}>Ver ofertas</Button>
      </div>
    );
  }

  const total = getTotalPrice();

  return (
    <div className="container-app py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lista de items */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="font-serif text-2xl font-extrabold text-navy mb-6">
            Tu carrito
          </h1>

          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-cream p-5 space-y-4"
            >
              {/* Header del item */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Badge variant="cream">{item.empresa?.nombre || item.rubro}</Badge>
                  <h3 className="font-serif font-bold text-lg text-navy mt-2">
                    {item.titulo}
                  </h3>
                  <p className="text-sm text-navy/60 mt-1">{item.descripcion}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-coral hover:text-coral/70 font-semibold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Detalles y cantidad */}
              <div className="border-t border-cream pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-navy/60">Costo por cupón:</span>
                  <span className="font-semibold text-teal">${item.costo_cupon}</span>
                </div>

                {/* Selector de cantidad */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy/60">Cantidad:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 bg-navy/10 text-navy rounded-lg hover:bg-navy/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        let val = parseInt(e.target.value) || 1;
                        val = Math.max(1, val);
                        updateQuantity(item.id, val);
                      }}
                      className="w-14 text-center py-1 border-2 border-cream rounded-lg focus:outline-none focus:border-teal"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 bg-navy/10 text-navy rounded-lg hover:bg-navy/20"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between pt-3 border-t border-cream">
                  <span className="font-semibold text-navy">Subtotal:</span>
                  <span className="font-bold text-teal">
                    ${(item.costo_cupon * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del carrito */}
        <div className="md:col-span-1">
          <div className="sticky top-24 bg-cream-bg rounded-2xl border border-cream p-6 space-y-5">
            <Badge variant="cream">Resumen</Badge>

            <h2 className="font-serif text-2xl font-extrabold text-navy">
              Total
            </h2>

            {/* Detalles del total */}
            <div className="space-y-3 text-sm text-navy/70 border-b border-cream pb-4">
              <div className="flex justify-between">
                <span>Artículos:</span>
                <span className="font-semibold">{cart.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Cupones:</span>
                <span className="font-semibold">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
            </div>

            {/* Total a pagar */}
            <div className="flex justify-between items-center border-b border-cream pb-4">
              <span className="font-semibold text-navy">Total a pagar:</span>
              <span className="text-3xl font-black text-teal">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={() => navigate("/checkout")}
                className="bg-teal hover:bg-teal/90"
              >
                Ir al checkout
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="ghost"
                onClick={() => navigate("/")}
              >
                Seguir comprando
              </Button>
              <button
                onClick={clearCart}
                className="w-full text-sm text-coral hover:text-coral/70 font-semibold py-2"
              >
                Vaciar carrito
              </button>
            </div>

            {/* Info */}
            <Alert type="info">
              No se realiza ningún cobro hasta que confirmes en el checkout
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
