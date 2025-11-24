import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'sm', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      success: 'bg-success-bg text-success-dark border-success-border',
      warning: 'bg-warning-bg text-warning-dark border-warning-border',
      error: 'bg-error-bg text-error-dark border-error-border',
      info: 'bg-info-bg text-info border-info-border',
      neutral: 'bg-bg-tertiary text-text-secondary border-border-medium',
    };

    const sizes = {
      sm: 'h-6 px-2 text-xs',
      md: 'h-7 px-3 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-badge border font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
