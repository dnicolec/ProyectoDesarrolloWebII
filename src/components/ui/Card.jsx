const Card = ({
  children,
  className = '',
  hover = true,
  padding = true,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-cream
        ${padding ? 'p-5' : ''}
        ${hover ? 'hover:shadow-xl hover:shadow-navy/[0.08] hover:-translate-y-2 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-sage/20' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;