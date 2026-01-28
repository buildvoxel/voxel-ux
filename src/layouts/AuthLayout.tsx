import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { voxelColors, voxelFonts } from '@/theme/muiTheme';

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: voxelColors.bgPrimary,
        backgroundImage: `
          linear-gradient(to right, ${voxelColors.grid} 1px, transparent 1px),
          linear-gradient(to bottom, ${voxelColors.grid} 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          border: `1px solid ${voxelColors.border}`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* Logo */}
          <Box
            sx={{
              width: 48,
              height: 48,
              backgroundColor: voxelColors.primary,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <ScienceOutlinedIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: voxelFonts.display,
              fontWeight: 400,
              fontSize: '1.75rem',
              color: voxelColors.textPrimary,
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
