/**
 * PageHeader Component
 * Standardized page header with consistent typography
 */

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useThemeStore } from '@/store/themeStore';
import { getPageTitleStyles } from '@/theme/typography';

interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Right-side actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Optional bottom margin override */
  mb?: number;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  mb = 3,
}) => {
  const { config, mode } = useThemeStore();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb }}>
      <Box>
        <Typography
          variant="h1"
          sx={getPageTitleStyles(config, mode)}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
