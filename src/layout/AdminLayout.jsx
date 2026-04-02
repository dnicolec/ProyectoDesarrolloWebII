import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

const navItems = [
  {
    section: 'General',
    items: [
      { label: 'Empresas', path: '/admin/empresas', dot: 'coral' },
      { label: 'Clientes', path: '/admin/clientes', dot: 'teal' },
      { label: 'Rubros', path: '/admin/rubros', dot: 'sage' },
    ],
  },
  {
    section: 'Ofertas',
    items: [
      { label: 'Por aprobar', path: '/admin/ofertas/pendientes', dot: 'cream' },
    ],
  },
];

const dotColors = {
  coral: 'bg-coral',
  teal: 'bg-teal',
  sage: 'bg-sage',
  cream: 'bg-cream',
};

export default function AdminLayout({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-cream-bg font-sans">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-cream h-14 flex items-center px-4 sm:px-6 justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-1.5 rounded-lg hover:bg-cream-light text-navy/60"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link to="/admin/empresas" className="flex items-center gap-1">
            <span className="text-lg font-serif font-extrabold">
              <span className="text-coral">La</span>{' '}
              <span className="text-teal">Cuponera</span>
            </span>
            <span className="hidden sm:inline text-[11px] font-sans font-medium text-navy/40 ml-1 mt-0.5">
              Panel Admin
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-cream-bg border border-cream rounded-full pl-1.5 pr-3 py-1">
            <div className="w-6 h-6 rounded-full bg-teal text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <span className="text-xs font-medium text-navy hidden sm:block">{displayName}</span>
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
        {/* Sidebar — desktop */}
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
                        ${isActive
                          ? 'text-white bg-white/8 border-coral opacity-100'
                          : 'text-white/55 border-transparent hover:text-white/85 hover:bg-white/5'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[item.dot]}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-[10px] text-white/30">Admin La Cuponera</p>
          </div>
        </aside>

        {/* Sidebar — mobile overlay */}
        {menuOpen && (
          <div className="sm:hidden fixed inset-0 z-50 flex">
            <div className="w-52 bg-navy flex flex-col">
              <div className="h-14 flex items-center px-4 border-b border-white/10">
                <span className="text-base font-serif font-extrabold">
                  <span className="text-coral">La</span>{' '}
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
                            ${isActive
                              ? 'text-white bg-white/8 border-coral opacity-100'
                              : 'text-white/55 border-transparent hover:text-white/85 hover:bg-white/5'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[item.dot]}`} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setMenuOpen(false)} />
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