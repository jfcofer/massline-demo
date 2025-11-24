import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-normal ease-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg',
      secondary:
        'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
      text: 'bg-transparent text-primary hover:bg-primary/10',
      danger:
        'bg-error text-white hover:bg-error/90 shadow-md hover:shadow-lg',
    };

    const sizes = {
      sm: 'h-11 px-4 text-sm rounded-lg',
      md: 'h-14 px-6 text-base rounded-button-mobile touch-target',
      lg: 'h-16 px-8 text-lg rounded-button-mobile',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        )}
        {!isLoading && children}
        {isLoading && <span className="sr-only">Cargando...</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
