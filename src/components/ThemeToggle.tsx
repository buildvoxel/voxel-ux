import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Palette, Check } from '@phosphor-icons/react';
import { useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import type { ThemeMode } from '@/store/themeStore';

const themeOptions: { mode: ThemeMode; name: string; description: string; preview: string[] }[] = [
  {
    mode: 'craftsman',
    name: 'Craftsman',
    description: 'Precision meets warmth',
    preview: ['#B8860B', '#1C1917', '#FBF9F4'],
  },
  {
    mode: 'modern',
    name: 'Modern Gradient',
    description: 'Dynamic precision',
    preview: ['#0D9488', '#7C3AED', '#0EA5E9'],
  },
  {
    mode: 'indigo',
    name: 'Indigo Mint',
    description: 'Technical but approachable',
    preview: ['#4F46E5', '#34D399', '#1E1B4B'],
  },
];

export function ThemeToggle() {
  const { mode, setMode, config } = useThemeStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newMode: ThemeMode) => {
    setMode(newMode);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Switch theme">
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{
            color: config.colors.textSecondary,
            '&:hover': { color: config.colors.primary },
          }}
        >
          <Palette size={20} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 240,
              mt: 0.5,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Design System
          </Typography>
        </Box>
        <Divider />
        {themeOptions.map((option) => (
          <MenuItem
            key={option.mode}
            onClick={() => handleSelect(option.mode)}
            selected={mode === option.mode}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              {mode === option.mode ? (
                <Check size={18} color={config.colors.primary} weight="bold" />
              ) : (
                <Box sx={{ width: 18 }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={option.name}
              secondary={option.description}
              primaryTypographyProps={{ fontWeight: mode === option.mode ? 600 : 400 }}
            />
            <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
              {option.preview.map((color, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
              ))}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
