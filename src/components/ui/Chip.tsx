import React, { lazy, Suspense } from 'react';
import MuiChip from '@mui/material/Chip';
import type { ChipProps as MuiChipProps } from '@mui/material/Chip';
import { useThemeStore } from '@/store/themeStore';

// Lazy load shadcn Chip
const ShadcnChip = lazy(() =>
  import('./shadcn/Chip').then((mod) => ({ default: mod.Chip }))
);

export interface ChipProps {
  label: React.ReactNode;
  variant?: 'filled' | 'outlined';
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium';
  onDelete?: () => void;
  onClick?: () => void;
  icon?: React.ReactElement;
  avatar?: React.ReactElement;
  deleteIcon?: React.ReactElement;
  disabled?: boolean;
  className?: string;
  sx?: MuiChipProps['sx'];
}

// Map MUI color to shadcn variant
const mapToShadcnVariant = (
  color?: string,
  variant?: string
): 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' => {
  if (variant === 'outlined') return 'outline';

  switch (color) {
    case 'secondary':
      return 'secondary';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'primary':
    default:
      return 'default';
  }
};

export function Chip({
  label,
  variant = 'filled',
  color = 'default',
  size = 'medium',
  onDelete,
  onClick,
  icon,
  avatar,
  deleteIcon,
  disabled,
  className,
  sx,
}: ChipProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense
        fallback={
          <MuiChip
            label={label}
            variant={variant}
            color={color}
            size={size}
            onDelete={onDelete}
            onClick={onClick}
            icon={icon}
            avatar={avatar}
            deleteIcon={deleteIcon}
            disabled={disabled}
            className={className}
            sx={sx}
          />
        }
      >
        <ShadcnChip
          variant={mapToShadcnVariant(color, variant)}
          size={size === 'small' ? 'sm' : 'default'}
          onDelete={onDelete}
          className={`${className || ''} ${onClick ? 'cursor-pointer' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={onClick}
        >
          {icon && <span className="mr-1 flex items-center">{icon}</span>}
          {avatar && <span className="mr-1">{avatar}</span>}
          {label}
        </ShadcnChip>
      </Suspense>
    );
  }

  return (
    <MuiChip
      label={label}
      variant={variant}
      color={color}
      size={size}
      onDelete={onDelete}
      onClick={onClick}
      icon={icon}
      avatar={avatar}
      deleteIcon={deleteIcon}
      disabled={disabled}
      className={className}
      sx={sx}
    />
  );
}

export default Chip;
