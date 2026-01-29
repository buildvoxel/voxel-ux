import React, { lazy, Suspense } from 'react';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import type { TabsProps as MuiTabsProps } from '@mui/material/Tabs';
import type { TabProps as MuiTabProps } from '@mui/material/Tab';
import { useThemeStore } from '@/store/themeStore';

// Lazy load shadcn Tabs components
const ShadcnTabs = lazy(() =>
  import('./shadcn/Tabs').then((mod) => ({ default: mod.Tabs }))
);
const ShadcnTabsList = lazy(() =>
  import('./shadcn/Tabs').then((mod) => ({ default: mod.TabsList }))
);
const ShadcnTabsTrigger = lazy(() =>
  import('./shadcn/Tabs').then((mod) => ({ default: mod.TabsTrigger }))
);

export interface TabsProps {
  value: number | string;
  onChange?: (event: React.SyntheticEvent, newValue: number | string) => void;
  children: React.ReactNode;
  className?: string;
  sx?: MuiTabsProps['sx'];
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  centered?: boolean;
  orientation?: 'horizontal' | 'vertical';
  indicatorColor?: 'primary' | 'secondary';
  textColor?: 'inherit' | 'primary' | 'secondary';
}

export function Tabs({
  value,
  onChange,
  children,
  className,
  sx,
  variant,
  centered,
  orientation,
  indicatorColor,
  textColor,
}: TabsProps) {
  const { config } = useThemeStore();

  // Extract tab labels from children for shadcn
  const tabLabels: { value: string; label: React.ReactNode }[] = [];
  React.Children.forEach(children, (child, index) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as { label?: React.ReactNode; value?: string | number };
      if (childProps.label) {
        tabLabels.push({
          value: childProps.value?.toString() || index.toString(),
          label: childProps.label,
        });
      }
    }
  });

  if (config.componentSystem === 'shadcn') {
    return (
      <Suspense
        fallback={
          <MuiTabs
            value={value}
            onChange={onChange}
            className={className}
            sx={sx}
            variant={variant}
            centered={centered}
            orientation={orientation}
            indicatorColor={indicatorColor}
            textColor={textColor}
          >
            {children}
          </MuiTabs>
        }
      >
        <ShadcnTabs
          value={value.toString()}
          onValueChange={(newValue) => {
            onChange?.(
              { type: 'change' } as React.SyntheticEvent,
              isNaN(Number(newValue)) ? newValue : Number(newValue)
            );
          }}
          className={className}
        >
          <ShadcnTabsList>
            {tabLabels.map((tab) => (
              <ShadcnTabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </ShadcnTabsTrigger>
            ))}
          </ShadcnTabsList>
        </ShadcnTabs>
      </Suspense>
    );
  }

  return (
    <MuiTabs
      value={value}
      onChange={onChange}
      className={className}
      sx={sx}
      variant={variant}
      centered={centered}
      orientation={orientation}
      indicatorColor={indicatorColor}
      textColor={textColor}
    >
      {children}
    </MuiTabs>
  );
}

export interface TabProps {
  label: React.ReactNode;
  value?: string | number;
  disabled?: boolean;
  icon?: React.ReactElement;
  iconPosition?: 'start' | 'end' | 'top' | 'bottom';
  className?: string;
  sx?: MuiTabProps['sx'];
  wrapped?: boolean;
}

export function Tab({
  label,
  value,
  disabled,
  icon,
  iconPosition,
  className,
  sx,
  wrapped,
}: TabProps) {
  // In shadcn mode, Tab is rendered as part of TabsTrigger in parent Tabs
  // So we just return MuiTab which will be handled by the Tabs wrapper
  return (
    <MuiTab
      label={label}
      value={value}
      disabled={disabled}
      icon={icon}
      iconPosition={iconPosition}
      className={className}
      sx={sx}
      wrapped={wrapped}
    />
  );
}

export default Tabs;
