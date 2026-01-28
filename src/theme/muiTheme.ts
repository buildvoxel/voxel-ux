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
    borderRadius: 4,
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
        // Global smooth transitions (Linear-style)
        '*, *::before, *::after': {
          transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease, transform 150ms ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: '0.8125rem',
          transition: 'all 150ms ease',
        },
        sizeSmall: {
          padding: '4px 10px',
          fontSize: '0.75rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
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
          borderColor: 'rgba(0, 0, 0, 0.12)',
          color: voxelColors.textPrimary,
          '&:hover': {
            borderColor: 'rgba(0, 0, 0, 0.24)',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        text: {
          color: voxelColors.textSecondary,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            color: voxelColors.textPrimary,
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
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 8,
          boxShadow: 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          '&:hover': {
            borderColor: 'rgba(0, 0, 0, 0.16)',
          },
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px',
          },
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
            borderRadius: 6,
            transition: 'all 150ms ease',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
              transition: 'border-color 150ms ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.24)',
            },
            '&.Mui-focused fieldset': {
              borderColor: voxelColors.primary,
              borderWidth: 1,
              boxShadow: `0 0 0 3px rgba(184, 134, 11, 0.08)`,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.12)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.24)',
          },
          '&.Mui-focused fieldset': {
            borderColor: voxelColors.primary,
            borderWidth: 1,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 16px 70px rgba(0, 0, 0, 0.15)',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '16px 20px 12px',
          fontSize: '1rem',
          fontWeight: 600,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '12px 20px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 20px 16px',
          gap: 8,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 12px',
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(184, 134, 11, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(184, 134, 11, 0.15)',
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: '2px 4px',
          padding: '6px 8px',
          fontSize: '0.875rem',
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(184, 134, 11, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(184, 134, 11, 0.15)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          transition: 'background-color 150ms ease, color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
          backgroundImage: 'none',
          padding: '4px',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: voxelColors.bgSecondary,
          '& .MuiTableCell-head': {
            color: voxelColors.textSecondary,
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '10px 16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            transition: 'background-color 150ms ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
            '&:last-child .MuiTableCell-body': {
              borderBottom: 'none',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '12px 16px',
        },
        body: {
          fontSize: '0.875rem',
          fontWeight: 400,
          color: voxelColors.textPrimary,
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
