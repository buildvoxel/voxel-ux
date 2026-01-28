import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Flask } from '@phosphor-icons/react';
import { useThemeStore, useBackgroundStyle } from '@/store/themeStore';

export function AuthLayout() {
  const { config, mode } = useThemeStore();
  const backgroundStyle = useBackgroundStyle();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...backgroundStyle,
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 380,
          p: 3,
          borderRadius: 1.5,
          border: `1px solid ${config.colors.border}`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* Logo */}
          <Box
            sx={{
              width: 48,
              height: 48,
              background: mode === 'modern' && config.gradients
                ? config.gradients.primary
                : config.colors.primary,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Flask size={24} color="white" weight="duotone" />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: config.fonts.display,
              fontWeight: mode === 'craftsman' ? 400 : 700,
              fontSize: '1.75rem',
              color: config.colors.textPrimary,
            }}
          >
            Voxel
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Welcome back! Please sign in to continue.
          </Typography>
        </Box>
        <Outlet />
      </Paper>
    </Box>
  );
}
