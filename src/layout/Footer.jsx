import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="container-app py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-serif font-bold">
                <span className="text-coral">La</span> {' '}
                <span className="text-teal">Cuponera</span>
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Ahorra y disfrutas de tus establecimientos favoritos con los mejores descuentos y promociones en un mismo lugar
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-white/40 mb-4">
              Navegación
            </h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-white/65 hover:text-teal-hover transition-colors">
                Ofertas
              </Link>
              <Link to="/register" className="block text-sm text-white/65 hover:text-teal-hover transition-colors">
                Registrarse
              </Link>
              <Link to="/login" className="block text-sm text-white/65 hover:text-teal-hover transition-colors">
                Iniciar sesión
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-white/40 mb-4">
              Contacto
            </h4>
            <div className="space-y-2 text-sm text-white/65">
              <p>lacuponera@info.com</p>
              <p>+503 2250-1234</p>
              <p>San Salvador, El Salvador</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.08] mt-8 pt-6 text-center">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} La Cuponera. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;