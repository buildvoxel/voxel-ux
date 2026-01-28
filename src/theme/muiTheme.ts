import { createTheme } from '@mui/material/styles';

// Voxel Craftsman Design System
// "Precision meets warmth" — A design language for infrastructure-grade product development tools.

// Color Palette
export const voxelColors = {
  // Primary Brand
  primary: '#B8860B', // Aged Brass
  primaryLight: '#D4A84B', // Antique Gold
  primaryDark: '#996F00', // Deep Gold

  // Neutrals - Backgrounds
  bgPrimary: '#FBF9F4', // Parchment
  bgSecondary: '#F5F3EE', // Warm Linen
  bgDark: '#1C1917', // Deep Charcoal
  surface: '#FFFFFF', // White

  // Neutrals - Text
  textPrimary: '#292524', // Espresso
  textSecondary: '#57534E', // Walnut

  // Neutrals - Borders & Grid
  border: '#D6D3CD', // Warm Border
  grid: '#E8E4DD', // Grid Line

  // Semantic - Success (Olive)
  success: '#4D7C0F',
  successBg: '#ECFCCB',

  // Semantic - Warning (Amber)
  warning: '#92400E',
  warningBg: '#FEF3C7',

  // Semantic - Error (Brick)
  error: '#991B1B',
  errorBg: '#FEE2E2',

  // Semantic - Info (Slate)
  info: '#1E40AF',
  infoBg: '#DBEAFE',
};

// Typography
export const voxelFonts = {
  display: "'Instrument Serif', Georgia, 'Times New Roman', serif",
  body: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
};

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: voxelColors.primary,
      light: voxelColors.primaryLight,
      dark: voxelColors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: voxelColors.bgDark,
      light: voxelColors.textSecondary,
      dark: '#0F0D0C',
      contrastText: '#ffffff',
    },
    background: {
      default: voxelColors.bgPrimary,
      paper: voxelColors.surface,
    },
    text: {
      primary: voxelColors.textPrimary,
      secondary: voxelColors.textSecondary,
    },
    divider: voxelColors.border,
    success: {
      main: voxelColors.success,
      light: voxelColors.successBg,
      contrastText: '#ffffff',
    },
    warning: {
      main: voxelColors.warning,
      light: voxelColors.warningBg,
      contrastText: '#ffffff',
    },
    error: {
      main: voxelColors.error,
      light: voxelColors.errorBg,
      contrastText: '#ffffff',
    },
    info: {
      main: voxelColors.info,
      light: voxelColors.infoBg,
      contrastText: '#ffffff',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: voxelFonts.body,
    h1: {
      fontFamily: voxelFonts.display,
      fontSize: '2.25rem',
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: voxelColors.textPrimary,
    },
    h2: {
      fontFamily: voxelFonts.display,
      fontSize: '1.875rem',
      fontWeight: 400,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
      color: voxelColors.textPrimary,
    },
    h3: {
      fontFamily: voxelFonts.display,
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.3,
      color: voxelColors.textPrimary,
    },
    h4: {
      fontFamily: voxelFonts.body,
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: voxelColors.textPrimary,
    },
    h5: {
      fontFamily: voxelFonts.body,
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: voxelColors.textPrimary,
    },
    h6: {
      fontFamily: voxelFonts.body,
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: voxelColors.textPrimary,
    },
    body1: {
      fontFamily: voxelFonts.body,
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: voxelFonts.body,
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: voxelFonts.body,
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
    overline: {
      fontFamily: voxelFonts.body,
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: voxelColors.textSecondary,
    },
    button: {
      fontFamily: voxelFonts.body,
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: voxelColors.bgPrimary,
          // Mathematical grid background pattern
          backgroundImage: `
            linear-gradient(to right, ${voxelColors.grid} 1px, transparent 1px),
            linear-gradient(to bottom, ${voxelColors.grid} 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '0.625rem 1.25rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: voxelColors.primary,
          '&:hover': {
            backgroundColor: voxelColors.primaryDark,
          },
        },
        containedSecondary: {
          backgroundColor: voxelColors.bgDark,
          '&:hover': {
            backgroundColor: voxelColors.textPrimary,
          },
        },
        outlined: {
          borderColor: voxelColors.border,
          color: voxelColors.textPrimary,
          '&:hover': {
            borderColor: voxelColors.primary,
            backgroundColor: voxelColors.bgSecondary,
          },
        },
        text: {
          color: voxelColors.primary,
          '&:hover': {
            backgroundColor: voxelColors.bgPrimary,
            color: voxelColors.primaryDark,
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: voxelColors.surface,
          border: `1px solid ${voxelColors.border}`,
          borderRadius: 12,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove grid from papers/cards
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 4,
        },
        colorSuccess: {
          backgroundColor: voxelColors.successBg,
          color: voxelColors.success,
        },
        colorWarning: {
          backgroundColor: voxelColors.warningBg,
          color: voxelColors.warning,
        },
        colorError: {
          backgroundColor: voxelColors.errorBg,
          color: voxelColors.error,
        },
        colorInfo: {
          backgroundColor: voxelColors.infoBg,
          color: voxelColors.info,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: voxelColors.bgDark,
          borderRight: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: voxelColors.bgDark,
          boxShadow: 'none',
          borderBottom: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: voxelColors.surface,
            '& fieldset': {
              borderColor: voxelColors.border,
            },
            '&:hover fieldset': {
              borderColor: voxelColors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: voxelColors.primary,
              boxShadow: `0 0 0 3px rgba(184, 134, 11, 0.1)`,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': {
            borderColor: voxelColors.border,
          },
          '&:hover fieldset': {
            borderColor: voxelColors.primary,
          },
          '&.Mui-focused fieldset': {
            borderColor: voxelColors.primary,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: `1px solid ${voxelColors.border}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(184, 134, 11, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(184, 134, 11, 0.2)',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: voxelColors.successBg,
          color: voxelColors.success,
        },
        standardWarning: {
          backgroundColor: voxelColors.warningBg,
          color: voxelColors.warning,
        },
        standardError: {
          backgroundColor: voxelColors.errorBg,
          color: voxelColors.error,
        },
        standardInfo: {
          backgroundColor: voxelColors.infoBg,
          color: voxelColors.info,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: voxelColors.bgDark,
          fontFamily: voxelFonts.body,
          fontSize: '0.75rem',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: `1px solid ${voxelColors.border}`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: voxelColors.primary,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            color: voxelColors.primary,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: voxelColors.bgSecondary,
        },
        bar: {
          backgroundColor: voxelColors.primary,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: voxelColors.primary,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: voxelColors.primary,
            '& + .MuiSwitch-track': {
              backgroundColor: voxelColors.primary,
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: voxelColors.primary,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: voxelColors.primary,
          },
        },
      },
    },
  },
});
