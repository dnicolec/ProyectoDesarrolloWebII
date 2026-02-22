const alertStyles = {
  success: {
    container: 'bg-sage/[0.12] border-sage/30',
    icon: 'text-sage-dark',
    text: 'text-sage-dark',
  },
  error: {
    container: 'bg-coral/[0.08] border-coral/25',
    icon: 'text-coral-hover',
    text: 'text-coral-hover',
  },
  info: {
    container: 'bg-teal/[0.08] border-teal/20',
    icon: 'text-teal',
    text: 'text-teal',
  },
  warning: {
    container: 'bg-cream border-cream',
    icon: 'text-navy',
    text: 'text-navy/80',
  },
};

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const Alert = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const style = alertStyles[type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-[14px] border
        transition-all duration-300 ease-out
        animate-fade-in
        ${style.container} ${className}
      `}
      role="alert"
    >
      <span className={`flex-shrink-0 text-lg mt-0.5 ${style.icon}`}>
        {icons[type]}
      </span>
      <div className="flex-1">
        {title && (
          <p className={`font-semibold text-sm ${style.text}`}>{title}</p>
        )}
        <div className={`text-sm leading-relaxed ${style.text} ${title ? 'mt-1' : ''}`}>
          {children}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${style.icon} hover:opacity-70 transition-opacity`}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;