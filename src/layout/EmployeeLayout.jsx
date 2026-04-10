import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const navItems = [
  {
    section: "Operaciones",
    items: [{ label: "Canjear cupón", path: "/empleado", dot: "teal" }],
  },
  {
    section: "Cuenta",
    items: [{ label: "Cambiar contraseña", path: "/password", dot: "sage" }],
  },
];

const dotColors = {
  coral: "bg-coral",
  teal: "bg-teal",
  sage: "bg-sage",
};

export default function EmployeeLayout({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mustChange, setMustChange] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const verificarSeguridad = async () => {
      if (user?.uid) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists() && docSnap.data().mustChangePass === true) {
            setMustChange(true);
          } else {
            setMustChange(false);
          }
        } catch (error) {
          console.error("Error verificando seguridad:", error);
        }
      }
      setVerificando(false);
    };
    verificarSeguridad();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Empleado";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (verificando) {
    return (
      <div className="min-h-screen bg-cream-bg flex items-center justify-center font-bold text-navy/50">
        Verificando credenciales...
      </div>
    );
  }

  if (mustChange) {
    if (!location.pathname.includes("/password")) {
      return (
        <div className="min-h-screen bg-cream-bg flex items-center justify-center p-4">
          <div className="bg-white border border-cream p-8 rounded-2xl shadow-sm max-w-md text-center animate-slide-up">
            <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-coral"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-navy">
              Seguridad requerida
            </h2>
            <p className="text-navy/50 mt-2 mb-6">
              Por seguridad, debes cambiar tu contraseña temporal antes de poder
              canjear cupones.
            </p>
            <Link
              to="/empleado/password"
              className="block w-full bg-teal text-white py-3 rounded-xl font-bold hover:bg-teal-dark transition-colors"
            >
              Configurar nueva contraseña
            </Link>
            <button
              onClick={handleLogout}
              className="mt-4 text-sm text-navy/30 hover:text-coral font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      );
    } else {
      return <Outlet />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-bg font-sans">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-cream h-14 flex items-center px-4 sm:px-6 justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="sm:hidden p-1.5 rounded-lg hover:bg-cream-light text-navy/60"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link to="/empresa/ofertas" className="flex items-center gap-1">
            <span className="text-lg font-serif font-extrabold">
              <span className="text-coral">La</span>{" "}
              <span className="text-teal">Cuponera</span>
            </span>
            <span className="hidden sm:inline text-[11px] font-sans font-medium text-navy/40 ml-1 mt-0.5">
              Panel Empleado
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-cream-bg border border-cream rounded-full pl-1.5 pr-3 py-1">
            <div className="w-6 h-6 rounded-full bg-coral text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <span className="text-xs font-medium text-navy hidden sm:block">
              {displayName}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-coral border border-cream rounded-lg px-3 py-1.5 hover:bg-coral/5 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar desktop */}
        <aside className="hidden sm:flex w-52 bg-navy flex-col flex-shrink-0">
          <nav className="flex-1 py-4">
            {navItems.map((group) => (
              <div key={group.section} className="mb-2">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30 px-4 mb-1.5 mt-3">
                  {group.section}
                </p>
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium transition-all border-l-2
                        ${
                          isActive
                            ? "text-white bg-white/8 border-coral opacity-100"
                            : "text-white/55 border-transparent hover:text-white/85 hover:bg-white/5"
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[item.dot]}`}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-[10px] text-white/30">Empleado Empresa</p>
          </div>
        </aside>

        {/* Sidebar mobile */}
        {menuOpen && (
          <div className="sm:hidden fixed inset-0 z-50 flex">
            <div className="w-52 bg-navy flex flex-col">
              <div className="h-14 flex items-center px-4 border-b border-white/10">
                <span className="text-base font-serif font-extrabold">
                  <span className="text-coral">La</span>{" "}
                  <span className="text-teal">Cuponera</span>
                </span>
              </div>
              <nav className="flex-1 py-4">
                {navItems.map((group) => (
                  <div key={group.section} className="mb-2">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30 px-4 mb-1.5 mt-3">
                      {group.section}
                    </p>
                    {group.items.map((item) => {
                      const isActive = location.pathname.startsWith(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium transition-all border-l-2
                            ${
                              isActive
                                ? "text-white bg-white/8 border-coral opacity-100"
                                : "text-white/55 border-transparent hover:text-white/85 hover:bg-white/5"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[item.dot]}`}
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
            <div
              className="flex-1 bg-black/40"
              onClick={() => setMenuOpen(false)}
            />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
