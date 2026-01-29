import React, { lazy, Suspense } from 'react';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogActions from '@mui/material/DialogActions';
import type { DialogProps as MuiDialogProps } from '@mui/material/Dialog';
import Fade from '@mui/material/Fade';
import { useThemeStore } from '@/store/themeStore';

// Lazy load shadcn Dialog components
const ShadcnDialog = lazy(() =>
  import('./shadcn/Dialog').then((mod) => ({ default: mod.Dialog }))
);
const ShadcnDialogContent = lazy(() =>
  import('./shadcn/Dialog').then((mod) => ({ default: mod.DialogContent }))
);
const ShadcnDialogHeader = lazy(() =>
  import('./shadcn/Dialog').then((mod) => ({ default: mod.DialogHeader }))
);
const ShadcnDialogFooter = lazy(() =>
  import('./shadcn/Dialog').then((mod) => ({ default: mod.DialogFooter }))
);
const ShadcnDialogTitle = lazy(() =>
  import('./shadcn/Dialog').then((mod) => ({ default: mod.DialogTitle }))
);

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  fullScreen?: boolean;
  TransitionComponent?: React.ComponentType<any>;
  className?: string;
  sx?: MuiDialogProps['sx'];
}

export function Dialog({
  open,
  onClose,
  children,
  maxWidth = 'sm',
  fullWidth,
  fullScreen,
  TransitionComponent = Fade,
  className,
  sx,
}: DialogProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense
        fallback={
          <MuiDialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            fullScreen={fullScreen}
            TransitionComponent={TransitionComponent}
            className={className}
            sx={sx}
          >
            {children}
          </MuiDialog>
        }
      >
        <ShadcnDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
          <ShadcnDialogContent
            className={`${className || ''} ${
              maxWidth === 'xs'
                ? 'max-w-xs'
                : maxWidth === 'sm'
                ? 'max-w-md'
                : maxWidth === 'md'
                ? 'max-w-lg'
                : maxWidth === 'lg'
                ? 'max-w-2xl'
                : maxWidth === 'xl'
                ? 'max-w-4xl'
                : ''
            }`}
          >
            {children}
          </ShadcnDialogContent>
        </ShadcnDialog>
      </Suspense>
    );
  }

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      TransitionComponent={TransitionComponent}
      className={className}
      sx={sx}
    >
      {children}
    </MuiDialog>
  );
}

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
  sx?: MuiDialogProps['sx'];
}

export function DialogTitle({ children, className, sx }: DialogTitleProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense fallback={<MuiDialogTitle sx={sx}>{children}</MuiDialogTitle>}>
        <ShadcnDialogHeader>
          <ShadcnDialogTitle className={className}>{children}</ShadcnDialogTitle>
        </ShadcnDialogHeader>
      </Suspense>
    );
  }

  return (
    <MuiDialogTitle sx={sx} className={className}>
      {children}
    </MuiDialogTitle>
  );
}

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  sx?: MuiDialogProps['sx'];
  dividers?: boolean;
}

export function DialogContent({ children, className, sx, dividers }: DialogContentProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense fallback={<MuiDialogContent sx={sx} dividers={dividers}>{children}</MuiDialogContent>}>
        <div className={`py-2 ${className || ''}`}>{children}</div>
      </Suspense>
    );
  }

  return (
    <MuiDialogContent sx={sx} className={className} dividers={dividers}>
      {children}
    </MuiDialogContent>
  );
}

export interface DialogActionsProps {
  children: React.ReactNode;
  className?: string;
  sx?: MuiDialogProps['sx'];
  disableSpacing?: boolean;
}

export function DialogActions({ children, className, sx, disableSpacing }: DialogActionsProps) {
  const { config } = useThemeStore();

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense fallback={<MuiDialogActions sx={sx} disableSpacing={disableSpacing}>{children}</MuiDialogActions>}>
        <ShadcnDialogFooter className={className}>{children}</ShadcnDialogFooter>
      </Suspense>
    );
  }

  return (
    <MuiDialogActions sx={sx} className={className} disableSpacing={disableSpacing}>
      {children}
    </MuiDialogActions>
  );
}

export default Dialog;
