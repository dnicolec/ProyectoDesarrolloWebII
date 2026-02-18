import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import SearchIcon from '../components/ui/icons/SearchIcon';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container-app py-20 text-center">
      <SearchIcon
        size={72}
        className="mx-auto text-navy/30 mb-6"
      />

      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-navy mb-3">
        404
      </h1>

      <p className="text-base sm:text-lg text-navy/50 mb-8 max-w-md mx-auto">
        La página que buscas no existe
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate('/')}
      >
        Volver a las ofertas
      </Button>
    </div>
  );
};

export default NotFoundPage;