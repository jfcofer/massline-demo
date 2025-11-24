import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  text,
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        className={cn('animate-spin text-primary', sizes[size], className)}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-text-secondary">{text}</p>
      )}
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export default Spinner;
