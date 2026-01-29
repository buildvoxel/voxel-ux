import React, { lazy, Suspense } from 'react';
import MuiSwitch from '@mui/material/Switch';
import type { SwitchProps as MuiSwitchProps } from '@mui/material/Switch';
import { useThemeStore } from '@/store/themeStore';

// Lazy load shadcn Switch
const ShadcnSwitch = lazy(() =>
  import('./shadcn/Switch').then((mod) => ({ default: mod.Switch }))
);

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
  className?: string;
  sx?: MuiSwitchProps['sx'];
  name?: string;
  id?: string;
  inputProps?: MuiSwitchProps['inputProps'];
}

export function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled,
  size = 'medium',
  color = 'primary',
  className,
  sx,
  name,
  id,
  inputProps,
}: SwitchProps) {
  const { config } = useThemeStore();
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);

  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e, e.target.checked);
  };

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense
        fallback={
          <MuiSwitch
            checked={currentChecked}
            onChange={handleChange}
            disabled={disabled}
            size={size}
            color={color}
            className={className}
            sx={sx}
            name={name}
            id={id}
            inputProps={inputProps}
          />
        }
      >
        <ShadcnSwitch
          checked={currentChecked}
          onCheckedChange={(newChecked) => {
            const syntheticEvent = {
              target: { checked: newChecked, name, id },
            } as React.ChangeEvent<HTMLInputElement>;
            if (!isControlled) {
              setInternalChecked(newChecked);
            }
            onChange?.(syntheticEvent, newChecked);
          }}
          disabled={disabled}
          size={size === 'small' ? 'small' : 'default'}
          className={className}
          name={name}
          id={id}
        />
      </Suspense>
    );
  }

  return (
    <MuiSwitch
      checked={currentChecked}
      onChange={handleChange}
      disabled={disabled}
      size={size}
      color={color}
      className={className}
      sx={sx}
      name={name}
      id={id}
      inputProps={inputProps}
    />
  );
}

export default Switch;
