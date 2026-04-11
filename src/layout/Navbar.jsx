import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getRutaPorRol, ROLES } from "../helpers/roleHelper";
import Button from "../components/ui/Button";
import MenuIcon from "../components/ui/icons/MenuIcon";
import CloseIcon from "../components/ui/icons/CloseIcon";
import CartIcon from "../components/ui/icons/CartIcon";

const Navbar = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { role } = useAuth();

  const cartItems = getTotalItems();
  const esAdmin = role === ROLES.ADMIN_CUPONERA || role === ROLES.ADMIN_EMPRESA;
  const panelPath = esAdmin ? getRutaPorRol(role) : null;

  return (
    <nav className="sticky top-0 z-40 bg-white/92 backdrop-blur-md border-b border-cream">
      <div className="container-app">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-lg sm:text-xl font-serif font-extrabold text-navy">
              <span className="text-coral">La</span>{" "}
              <span className="text-teal">Cuponera</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-navy hover:text-teal transition-colors"
            >
              Ofertas
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {esAdmin ? (
                  /* Admins: solo link al panel, sin carrito ni mis cupones */
                  <Link
                    to={panelPath}
                    className="text-sm font-medium text-teal hover:text-teal/80 transition-colors"
                  >
                    Ir al panel de administrador
                  </Link>
                ) : (
                  /* Clientes: links habituales */
                  <>
                    <Link
                      to="/my-coupons"
                      className="text-sm font-medium text-navy hover:text-teal transition-colors"
                    >
                      Mis cupones
                    </Link>
                    <button
                      onClick={() => navigate("/cart")}
                      className="relative text-navy hover:text-teal transition-colors"
                    >
                      <CartIcon size={20} />
                      {cartItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-coral text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-light shadow-lg shadow-coral/30">
                          {cartItems}
                        </span>
                      )}
                    </button>
                  </>
                )}
                <div className="h-5 w-px bg-cream" />
                <span className="text-sm text-navy/50">
                  Hola,{" "}
                  <span className="font-semibold text-navy">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </span>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Iniciar sesión
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Registrarse
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-cream-light transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <CloseIcon className="text-navy" />
            ) : (
              <MenuIcon className="text-navy" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-cream py-4 space-y-3 animate-slide-down">
            <Link
              to="/"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-navy hover:bg-cream"
              onClick={() => setMenuOpen(false)}
            >
              Ofertas
            </Link>

            {user ? (
              <>
                {esAdmin ? (
                  <Link
                    to={panelPath}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-teal hover:bg-cream-light"
                    onClick={() => setMenuOpen(false)}
                  >
                    Ir al panel de administrador
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/my-coupons"
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-navy/60 hover:bg-cream-light"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mis cupones
                    </Link>
                    <Link
                      to="/cart"
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-navy/60 hover:bg-cream-light relative"
                      onClick={() => setMenuOpen(false)}
                    >
                      Carrito
                      {cartItems > 0 && (
                        <span className="absolute right-3 top-2 bg-coral text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {cartItems}
                        </span>
                      )}
                    </Link>
                  </>
                )}
                <div className="px-3 pt-2 border-t border-cream">
                  <p className="text-sm text-navy/50 mb-2">
                    {user.displayName || user.email?.split("@")[0]}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                  >
                    Cerrar sesión
                  </Button>
                </div>
              </>
            ) : (
              <div className="px-3 pt-2 border-t border-cream space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  size="sm"
                  fullWidth
                  onClick={() => {
                    navigate("/register");
                    setMenuOpen(false);
                  }}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
