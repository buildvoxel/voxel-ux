import React, { lazy, Suspense } from 'react';
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import MuiCardHeader from '@mui/material/CardHeader';
import MuiCardActions from '@mui/material/CardActions';
import type { CardProps as MuiCardProps } from '@mui/material/Card';
import { useThemeStore } from '@/store/themeStore';

// Lazy load shadcn Card components
const ShadcnCard = lazy(() =>
  import('./shadcn/Card').then((mod) => ({ default: mod.Card }))
);
const ShadcnCardContent = lazy(() =>
  import('./shadcn/Card').then((mod) => ({ default: mod.CardContent }))
);
const ShadcnCardHeader = lazy(() =>
  import('./shadcn/Card').then((mod) => ({ default: mod.CardHeader }))
);
const ShadcnCardFooter = lazy(() =>
  import('./shadcn/Card').then((mod) => ({ default: mod.CardFooter }))
);

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  sx?: MuiCardProps['sx'];
  onClick?: () => void;
  elevation?: number;
  variant?: 'elevation' | 'outlined';
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function Card({ children, className, sx, onClick, elevation, variant, onDragEnter, onDragOver, onDragLeave, onDrop }: CardProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense fallback={<MuiCard sx={sx} onClick={onClick} elevation={elevation} variant={variant} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>{children}</MuiCard>}>
        <ShadcnCard
          className={className}
          onClick={onClick}
          style={sx as React.CSSProperties}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {children}
        </ShadcnCard>
      </Suspense>
    );
  }

  return (
    <MuiCard sx={sx} onClick={onClick} className={className} elevation={elevation} variant={variant} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {children}
    </MuiCard>
  );
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  sx?: MuiCardProps['sx'];
}

export function CardContent({ children, className, sx }: CardContentProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense fallback={<MuiCardContent sx={sx}>{children}</MuiCardContent>}>
        <ShadcnCardContent className={className} style={sx as React.CSSProperties}>
          {children}
        </ShadcnCardContent>
      </Suspense>
    );
  }

  return (
    <MuiCardContent sx={sx} className={className}>
      {children}
    </MuiCardContent>
  );
}

export interface CardHeaderProps {
  title?: React.ReactNode;
  subheader?: React.ReactNode;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
  className?: string;
  sx?: MuiCardProps['sx'];
}

export function CardHeader({ title, subheader, action, avatar, className, sx }: CardHeaderProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense
        fallback={
          <MuiCardHeader title={title} subheader={subheader} action={action} avatar={avatar} sx={sx} />
        }
      >
        <ShadcnCardHeader className={className} style={sx as React.CSSProperties}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {avatar}
              <div>
                {title && <div className="font-semibold text-text-primary">{title}</div>}
                {subheader && <div className="text-sm text-text-secondary">{subheader}</div>}
              </div>
            </div>
            {action}
          </div>
        </ShadcnCardHeader>
      </Suspense>
    );
  }

  return (
    <MuiCardHeader
      title={title}
      subheader={subheader}
      action={action}
      avatar={avatar}
      sx={sx}
      className={className}
    />
  );
}

export interface CardActionsProps {
  children: React.ReactNode;
  className?: string;
  sx?: MuiCardProps['sx'];
  disableSpacing?: boolean;
}

export function CardActions({ children, className, sx, disableSpacing }: CardActionsProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense fallback={<MuiCardActions sx={sx} disableSpacing={disableSpacing}>{children}</MuiCardActions>}>
        <ShadcnCardFooter className={className} style={sx as React.CSSProperties}>
          {children}
        </ShadcnCardFooter>
      </Suspense>
    );
  }

  return (
    <MuiCardActions sx={sx} className={className} disableSpacing={disableSpacing}>
      {children}
    </MuiCardActions>
  );
}

export default Card;
