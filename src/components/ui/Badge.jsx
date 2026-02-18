const badgeStyles = {
  coral: 'bg-coral/[0.12] text-coral-hover',
  teal: 'bg-teal/[0.1] text-teal',
  sage: 'bg-sage/[0.18] text-sage-dark',
  navy: 'bg-navy/[0.07] text-navy',
  cream: 'bg-cream text-navy',
};

const Badge = ({
  children,
  variant = 'cream',
  size = 'sm',
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-bold rounded-lg
        ${badgeStyles[variant]}
        ${size === 'sm'
          ? 'px-2.5 py-0.5 text-[0.72rem] tracking-wide uppercase'
          : 'px-3 py-1 text-sm'
        }
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;