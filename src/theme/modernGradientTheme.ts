import { createTheme } from '@mui/material/styles';

// Voxel Modern Gradient Design System
// "Dynamic precision" — A bold, ultra-modern design language with Indigo & Mint

// Color Palette - Indigo Mint inspired
export const modernColors = {
  // Primary - Indigo
  primary: '#4F46E5', // Electric Indigo
  primaryLight: '#6366F1', // Indigo Light
  primaryBright: '#818CF8', // Bright Indigo
  primaryDark: '#3730A3', // Deep Indigo

  // Secondary - Mint
  secondary: '#34D399', // Fresh Mint
  secondaryLight: '#6EE7B7', // Mint Light
  secondaryBright: '#A7F3D0', // Soft Mint
  secondaryDark: '#059669', // Deep Mint

  // Accent - Mint Medium
  accent: '#10B981', // Emerald
  accentLight: '#34D399', // Fresh Mint
  accentBright: '#6EE7B7', // Light Mint
  accentDark: '#047857', // Deep Emerald

  // Neutrals
  void: '#1E1B4B', // Deep Indigo (nav bar)
  textPrimary: '#1E1B4B', // Deep Indigo
  surfaceDark: '#312E81', // Indigo 900
  textSecondary: '#374151', // Gray 700
  textTertiary: '#6B7280', // Gray 500
  border: '#E5E7EB', // Gray 200
  bgSecondary: '#F3F4F6', // Gray 100
  bgPrimary: '#FAFBFF', // Snow with hint of indigo
  surface: '#FFFFFF', // White

  // Semantic
  success: '#059669', // Mint Dark
  successBg: '#D1FAE5',
  warning: '#D97706', // Amber
  warningBg: '#FEF3C7',
  error: '#DC2626', // Red
  errorBg: '#FEE2E2',
  info: '#4F46E5', // Indigo
  infoBg: '#EEF2FF',
};

// Gradients
export const modernGradients = {
  primary: 'linear-gradient(135deg, #4F46E5 0%, #34D399 100%)', // Indigo to Mint
  indigo: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)', // Indigo only
  mint: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)', // Mint only
  spectrum: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 25%, #34D399 50%, #10B981 75%, #6EE7B7 100%)',
  hero: 'linear-gradient(135deg, #4F46E5 0%, #34D399 50%, #10B981 100%)',
  meshSubtle: `
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(79, 70, 229, 0.12), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(52, 211, 153, 0.10), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(99, 102, 241, 0.08), transparent)
  `,
};

// Typography - Compact like Linear.app
export const modernFonts = {
  display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
};

// Shadows with Indigo glow
const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  glowIndigo: '0 4px 14px rgba(79, 70, 229, 0.35)',
  glowIndigoLg: '0 6px 20px rgba(79, 70, 229, 0.45)',
  glowMint: '0 4px 14px rgba(52, 211, 153, 0.35)',
  glowMintLg: '0 6px 20px rgba(52, 211, 153, 0.45)',
};

export const modernGradientTheme = createTheme({
  palette: {
    primary: {
      main: modernColors.primary,
      light: modernColors.primaryLight,
      dark: modernColors.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: modernColors.secondary,
      light: modernColors.secondaryLight,
      dark: modernColors.secondaryDark,
      contrastText: '#ffffff',
    },
    background: {
      default: modernColors.bgPrimary,
      paper: modernColors.surface,
    },
    text: {
      primary: modernColors.textPrimary,
      secondary: modernColors.textSecondary,
    },
    divider: modernColors.border,
    success: {
      main: modernColors.success,
      light: modernColors.successBg,
      contrastText: '#ffffff',
    },
    warning: {
      main: modernColors.warning,
      light: modernColors.warningBg,
      contrastText: '#ffffff',
    },
    error: {
      main: modernColors.error,
      light: modernColors.errorBg,
      contrastText: '#ffffff',
    },
    info: {
      main: modernColors.info,
      light: modernColors.infoBg,
      contrastText: '#ffffff',
    },
  },
  shape: {
    borderRadius: 4, // 50% sharper
  },
  typography: {
    fontFamily: modernFonts.body,
    // Compact typography (Linear-inspired)
    h1: {
      fontFamily: modernFonts.display,
      fontSize: '1.5rem', // Smaller
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: modernColors.textPrimary,
    },
    h2: {
      fontFamily: modernFonts.display,
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
      color: modernColors.textPrimary,
    },
    h3: {
      fontFamily: modernFonts.display,
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: modernColors.textPrimary,
    },
    h4: {
      fontFamily: modernFonts.display,
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.35,
      color: modernColors.textPrimary,
    },
    h5: {
      fontFamily: modernFonts.body,
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: modernColors.textPrimary,
    },
    h6: {
      fontFamily: modernFonts.body,
      fontSize: '0.8125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: modernColors.textPrimary,
    },
    body1: {
      fontFamily: modernFonts.body,
      fontSize: '0.8125rem', // 13px - Linear uses 13px body
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: modernFonts.body,
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: modernFonts.body,
      fontSize: '0.6875rem', // 11px
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
    overline: {
      fontFamily: modernFonts.body,
      fontSize: '0.625rem', // 10px
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: modernColors.textSecondary,
    },
    button: {
      fontFamily: modernFonts.body,
      fontWeight: 500,
      fontSize: '0.8125rem', // 13px
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: modernColors.bgPrimary,
          backgroundImage: modernGradients.meshSubtle,
        },
        '*, *::before, *::after': {
          transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease, transform 150ms ease, box-shadow 150ms ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 3, // 50% sharper
          padding: '4px 10px', // Compact
          fontSize: '0.8125rem', // 13px
          minHeight: 28, // Linear-style compact height
          transition: 'all 150ms ease',
        },
        sizeSmall: {
          padding: '2px 8px',
          fontSize: '0.75rem',
          minHeight: 24,
        },
        sizeMedium: {
          padding: '4px 10px',
          minHeight: 28,
        },
        sizeLarge: {
          padding: '6px 14px',
          minHeight: 32,
        },
        contained: {
          boxShadow: shadows.glowIndigo,
          '&:hover': {
            boxShadow: shadows.glowIndigoLg,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: modernGradients.indigo,
          '&:hover': {
            background: `linear-gradient(135deg, ${modernColors.primaryLight} 0%, ${modernColors.primary} 100%)`,
          },
        },
        containedSecondary: {
          background: modernGradients.mint,
          boxShadow: shadows.glowMint,
          '&:hover': {
            background: `linear-gradient(135deg, ${modernColors.secondaryLight} 0%, ${modernColors.secondary} 100%)`,
            boxShadow: shadows.glowMintLg,
          },
        },
        outlined: {
          borderColor: modernColors.border,
          borderWidth: 2,
          color: modernColors.textPrimary,
          backgroundColor: modernColors.surface,
          '&:hover': {
            borderColor: modernColors.primary,
            backgroundColor: modernColors.bgPrimary,
            borderWidth: 2,
          },
        },
        text: {
          color: modernColors.primary,
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
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
          backgroundColor: modernColors.surface,
          border: `1px solid ${modernColors.border}`,
          borderRadius: 4, // 50% sharper
          boxShadow: 'none',
          transition: 'all 150ms ease',
          '&:hover': {
            borderColor: modernColors.primaryLight,
          },
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.04)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '10px 12px', // Compact padding
          '&:last-child': {
            paddingBottom: '10px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 4, // Less rounded, more Linear-like
          fontSize: '0.6875rem', // 11px
          height: 20,
        },
        sizeSmall: {
          height: 18,
          fontSize: '0.625rem', // 10px
        },
        colorPrimary: {
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
          color: modernColors.primary,
          border: '1px solid rgba(79, 70, 229, 0.3)',
        },
        colorSecondary: {
          backgroundColor: 'rgba(52, 211, 153, 0.15)',
          color: modernColors.secondaryDark,
          border: '1px solid rgba(52, 211, 153, 0.3)',
        },
        colorSuccess: {
          backgroundColor: 'rgba(5, 150, 105, 0.15)',
          color: modernColors.success,
          border: '1px solid rgba(5, 150, 105, 0.3)',
        },
        colorWarning: {
          backgroundColor: 'rgba(217, 119, 6, 0.15)',
          color: modernColors.warning,
          border: '1px solid rgba(217, 119, 6, 0.3)',
        },
        colorError: {
          backgroundColor: 'rgba(220, 38, 38, 0.15)',
          color: modernColors.error,
          border: '1px solid rgba(220, 38, 38, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: modernColors.void,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: modernColors.void,
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
            backgroundColor: modernColors.surface,
            borderRadius: 3, // 50% sharper
            fontSize: '0.8125rem', // 13px
            transition: 'all 150ms ease',
            '& fieldset': {
              borderColor: modernColors.border,
              borderWidth: 1,
              transition: 'border-color 150ms ease',
            },
            '&:hover fieldset': {
              borderColor: modernColors.primaryLight,
            },
            '&.Mui-focused fieldset': {
              borderColor: modernColors.primary,
              borderWidth: 1,
              boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.1)',
            },
          },
          '& .MuiInputBase-input': {
            padding: '6px 10px', // Compact input padding
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 3, // 50% sharper
          '& fieldset': {
            borderColor: modernColors.border,
            borderWidth: 1,
          },
          '&:hover fieldset': {
            borderColor: modernColors.primaryLight,
          },
          '&.Mui-focused fieldset': {
            borderColor: modernColors.primary,
            borderWidth: 1,
          },
        },
        input: {
          padding: '6px 10px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 4, // 50% sharper
          boxShadow: '0 16px 40px -12px rgba(0, 0, 0, 0.2)',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '12px 16px 8px',
          fontSize: '0.9375rem', // 15px
          fontWeight: 600,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '8px 16px 12px',
          gap: 6,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '4px 8px', // Compact
          minHeight: 28,
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(79, 70, 229, 0.16)',
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          margin: '1px 4px',
          padding: '4px 8px', // Compact
          fontSize: '0.8125rem', // 13px
          minHeight: 28,
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(79, 70, 229, 0.16)',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // 50% sharper
          transition: 'background-color 150ms ease, color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: modernColors.successBg,
          color: modernColors.success,
          border: '1px solid rgba(5, 150, 105, 0.3)',
        },
        standardWarning: {
          backgroundColor: modernColors.warningBg,
          color: modernColors.warning,
          border: '1px solid rgba(217, 119, 6, 0.3)',
        },
        standardError: {
          backgroundColor: modernColors.errorBg,
          color: modernColors.error,
          border: '1px solid rgba(220, 38, 38, 0.3)',
        },
        standardInfo: {
          backgroundColor: modernColors.infoBg,
          color: modernColors.info,
          border: '1px solid rgba(79, 70, 229, 0.3)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: modernColors.void,
          fontFamily: modernFonts.body,
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: 6,
          padding: '6px 12px',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 4, // 50% sharper
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
          borderRadius: 4, // 50% sharper
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 4, // 50% sharper
          border: `1px solid ${modernColors.border}`,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: modernColors.bgSecondary,
          '& .MuiTableCell-head': {
            color: modernColors.textSecondary,
            fontSize: '0.625rem', // 10px
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '6px 10px', // Compact
            borderBottom: `1px solid ${modernColors.border}`,
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
              backgroundColor: 'rgba(79, 70, 229, 0.04)',
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
          borderBottom: `1px solid ${modernColors.border}`,
          padding: '6px 10px', // Compact
        },
        body: {
          fontSize: '0.8125rem', // 13px
          fontWeight: 400,
          color: modernColors.textPrimary,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 32,
        },
        indicator: {
          backgroundColor: modernColors.primary,
          height: 2,
          borderRadius: '2px 2px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.8125rem', // 13px
          minHeight: 32,
          padding: '6px 12px',
          '&.Mui-selected': {
            color: modernColors.primary,
            fontWeight: 600,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(79, 70, 229, 0.15)',
        },
        bar: {
          borderRadius: 4,
          background: modernGradients.primary,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: modernColors.primary,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: modernColors.primary,
            '& + .MuiSwitch-track': {
              backgroundColor: modernColors.primary,
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: modernColors.primary,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: modernColors.primary,
          },
        },
      },
    },
  },
});
