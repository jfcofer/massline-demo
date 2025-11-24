import React from 'react';
import { cn } from '../../lib/utils';

export interface LogoProps {
  variant?: 'massline' | 'mototrack';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'massline',
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-16',
    lg: 'h-20',
  };

  const imagePath =
    variant === 'massline'
      ? `${import.meta.env.BASE_URL}logo_massline.png`
      : `${import.meta.env.BASE_URL}logo_mototrack.png`;
  const altText =
    variant === 'massline' ? 'MASS LINE Logo' : 'MOTOTRACK Logo';

  return (
    <img
      src={imagePath}
      alt={altText}
      className={cn('object-contain', sizes[size], className)}
    />
  );
};

export default Logo;
