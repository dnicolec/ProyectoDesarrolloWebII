import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-teal text-white hover:bg-teal-hover shadow-md shadow-teal/25 active:scale-[0.98]',
  coral:
    'bg-coral text-white hover:bg-coral-hover shadow-md shadow-coral/30 active:scale-[0.98]',
  outline:
    'border-2 border-teal text-teal hover:bg-teal hover:text-white active:scale-[0.98]',
  ghost:
    'text-navy hover:bg-navy/5 active:scale-[0.98]',
  danger:
    'bg-coral text-white hover:bg-coral-hover shadow-md shadow-coral/25 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-4 py-[7px] text-[0.82rem] rounded-[10px]',
  md: 'px-5 py-2.5 text-[0.9rem] rounded-xl',
  lg: 'px-8 py-3.5 text-base rounded-[14px]',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          font-semibold font-sans transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-coral/40 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;