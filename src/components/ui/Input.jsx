import { forwardRef, useState } from 'react';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';
import ErrorIcon from './icons/ErrorIcon.jsx';

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      type = 'text',
      required = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label className="text-sm font-medium text-navy">
            {label}
            {required && <span className="text-coral ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage">
              <Icon size={18} />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={`
              w-full rounded-xl border-2 bg-white px-4 py-2.5
              text-navy placeholder:text-sage/60
              font-sans text-[0.9rem]
              transition-all duration-200
              focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20
              ${Icon ? 'pl-10' : ''}
              ${isPassword ? 'pr-10' : ''}
              ${
                error
                  ? 'border-coral ring-2 ring-coral/20'
                  : 'border-cream hover:border-coral/50'
              }
            `}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sage hover:text-navy transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-coral flex items-center gap-1">
            <ErrorIcon />
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-sm text-sage">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;