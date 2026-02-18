import { useEffect } from 'react';
import CloseIcon from './icons/CloseIcon';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]}
          p-6 animate-slide-up
        `}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h3 className="text-xl font-serif font-semibold text-navy">
                {title}
              </h3>
            )}

            {showClose && (
              <button
                onClick={onClose}
                className="text-sage hover:text-navy transition-colors p-1 rounded-lg hover:bg-cream-light"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default Modal;