import React, { lazy, Suspense } from 'react';
import MuiButton from '@mui/material/Button';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { useThemeStore } from '@/store/themeStore';

// Lazy load shadcn Button
const ShadcnButton = lazy(() =>
  import('./shadcn/Button').then((mod) => ({ default: mod.Button }))
);

// Unified props interface that works with both MUI and shadcn
export interface ButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  className?: string;
  sx?: MuiButtonProps['sx'];
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
}

// Map MUI props to shadcn variants
const mapToShadcnVariant = (
  variant?: string,
  color?: string
): 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' => {
  if (color === 'error') return 'destructive';
  if (color === 'secondary') return 'secondary';

  switch (variant) {
    case 'outlined':
      return 'outline';
    case 'text':
      return 'ghost';
    case 'contained':
    default:
      return 'default';
  }
};

const mapToShadcnSize = (size?: string): 'default' | 'sm' | 'lg' => {
  switch (size) {
    case 'small':
      return 'sm';
    case 'large':
      return 'lg';
    default:
      return 'default';
  }
};

export function Button({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  disabled,
  startIcon,
  endIcon,
  onClick,
  children,
  className,
  sx,
  fullWidth,
  type = 'button',
  href,
}: ButtonProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense
        fallback={
          <MuiButton
            variant={variant}
            color={color}
            size={size}
            disabled={disabled}
            startIcon={startIcon}
            endIcon={endIcon}
            onClick={onClick}
            className={className}
            sx={sx}
            fullWidth={fullWidth}
            type={type}
            href={href}
          >
            {children}
          </MuiButton>
        }
      >
        <ShadcnButton
          variant={mapToShadcnVariant(variant, color)}
          size={mapToShadcnSize(size)}
          disabled={disabled}
          onClick={onClick}
          className={`${className || ''} ${fullWidth ? 'w-full' : ''}`}
          type={type}
        >
          {startIcon && <span className="mr-1.5 flex items-center">{startIcon}</span>}
          {children}
          {endIcon && <span className="ml-1.5 flex items-center">{endIcon}</span>}
        </ShadcnButton>
      </Suspense>
    );
  }

  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      className={className}
      sx={sx}
      fullWidth={fullWidth}
      type={type}
      href={href}
    >
      {children}
    </MuiButton>
  );
}

export default Button;
