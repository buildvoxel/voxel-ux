import { createTheme } from '@mui/material/styles';

// Voxel Modern Gradient Design System
// "Dynamic precision" — A bold, ultra-modern design language that commands attention.

// Color Palette
export const modernColors = {
  // Primary - Teal
  primary: '#0D9488', // Vivid Teal
  primaryLight: '#14B8A6', // Bright Teal
  primaryBright: '#2DD4BF', // Cyan Glow
  primaryDark: '#0F766E', // Deep Teal

  // Secondary - Violet
  secondary: '#7C3AED', // Electric Violet
  secondaryLight: '#8B5CF6', // Bright Violet
  secondaryBright: '#A78BFA', // Soft Violet
  secondaryDark: '#6D28D9', // Deep Violet

  // Accent - Sky Blue
  accent: '#0EA5E9', // Sky Blue
  accentLight: '#38BDF8', // Light Sky
  accentBright: '#22D3EE', // Bright Cyan
  accentDark: '#0284C7', // Deep Sky

  // Neutrals
  void: '#030712', // Dark mode, nav bar
  textPrimary: '#0F172A', // Deep Space
  surfaceDark: '#1E293B', // Slate 800
  textSecondary: '#64748B', // Slate 500
  textTertiary: '#94A3B8', // Slate 400
  border: '#E2E8F0', // Slate 300
  bgSecondary: '#F1F5F9', // Slate 100
  bgPrimary: '#FAFBFC', // Snow
  surface: '#FFFFFF', // White

  // Semantic
  success: '#059669', // Emerald
  successBg: '#D1FAE5',
  warning: '#D97706', // Amber
  warningBg: '#FEF3C7',
  error: '#E11D48', // Rose
  errorBg: '#FFE4E6',
  info: '#0EA5E9', // Sky
  infoBg: '#E0F2FE',
};

// Gradients
export const modernGradients = {
  primary: 'linear-gradient(135deg, #14B8A6 0%, #7C3AED 100%)',
  teal: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  violet: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
  spectrum: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 25%, #7C3AED 50%, #8B5CF6 75%, #38BDF8 100%)',
  hero: 'linear-gradient(135deg, #0D9488 0%, #7C3AED 50%, #0EA5E9 100%)',
  meshSubtle: `
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.15), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(124, 58, 237, 0.12), transparent),
    radial-gradient(ellipse 50% 60% at 60% 80%, rgba(14, 165, 233, 0.10), transparent)
  `,
};

// Typography
export const modernFonts = {
  display: "'Cabinet Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
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
    borderRadius: 4,
  },
  typography: {
    fontFamily: modernFonts.body,
    h1: {
      fontFamily: modernFonts.display,
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
      color: modernColors.textPrimary,
    },
    h2: {
      fontFamily: modernFonts.display,
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: modernColors.textPrimary,
    },
    h3: {
      fontFamily: modernFonts.display,
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
      color: modernColors.textPrimary,
    },
    h4: {
      fontFamily: modernFonts.display,
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: modernColors.textPrimary,
    },
    h5: {
      fontFamily: modernFonts.body,
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: modernColors.textPrimary,
    },
    h6: {
      fontFamily: modernFonts.body,
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: modernColors.textPrimary,
    },
    body1: {
      fontFamily: modernFonts.body,
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: modernFonts.body,
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: modernFonts.body,
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
    overline: {
      fontFamily: modernFonts.body,
      fontSize: '0.6875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: modernColors.textSecondary,
    },
    button: {
      fontFamily: modernFonts.body,
      fontWeight: 600,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: modernColors.bgPrimary,
          // Gradient mesh background
          backgroundImage: modernGradients.meshSubtle,
        },
        // Global smooth transitions (Linear-style)
        '*, *::before, *::after': {
          transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease, transform 150ms ease, box-shadow 150ms ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
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
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: modernGradients.teal,
          '&:hover': {
            background: `linear-gradient(135deg, ${modernColors.primaryBright} 0%, ${modernColors.primaryLight} 100%)`,
          },
        },
        containedSecondary: {
          background: modernGradients.violet,
          '&:hover': {
            background: `linear-gradient(135deg, ${modernColors.secondaryBright} 0%, ${modernColors.secondaryLight} 100%)`,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 0, 0, 0.12)',
          borderWidth: 1,
          color: modernColors.textPrimary,
          '&:hover': {
            borderColor: 'rgba(0, 0, 0, 0.24)',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderWidth: 1,
          },
        },
        text: {
          color: modernColors.textSecondary,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            color: modernColors.textPrimary,
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
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderRadius: 8,
          boxShadow: 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          '&:hover': {
            borderColor: 'rgba(0, 0, 0, 0.12)',
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
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 4,
          height: '24px',
        },
        sizeSmall: {
          height: '20px',
          fontSize: '0.6875rem',
        },
        colorPrimary: {
          background: `linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(45, 212, 191, 0.15) 100%)`,
          color: modernColors.primary,
          border: `1px solid rgba(20, 184, 166, 0.3)`,
        },
        colorSuccess: {
          background: `linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)`,
          color: modernColors.success,
          border: `1px solid rgba(5, 150, 105, 0.3)`,
        },
        colorWarning: {
          background: `linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)`,
          color: modernColors.warning,
          border: `1px solid rgba(217, 119, 6, 0.3)`,
        },
        colorError: {
          background: `linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%)`,
          color: modernColors.error,
          border: `1px solid rgba(225, 29, 72, 0.3)`,
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
            borderRadius: 6,
            transition: 'all 150ms ease',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
              borderWidth: 1,
              transition: 'border-color 150ms ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.24)',
            },
            '&.Mui-focused fieldset': {
              borderColor: modernColors.primary,
              borderWidth: 1,
              boxShadow: `0 0 0 3px rgba(20, 184, 166, 0.1)`,
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
            borderWidth: 1,
          },
          '&:hover fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.24)',
          },
          '&.Mui-focused fieldset': {
            borderColor: modernColors.primary,
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
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(20, 184, 166, 0.15)',
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
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(20, 184, 166, 0.15)',
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
          background: `linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)`,
          color: modernColors.success,
          border: `1px solid rgba(5, 150, 105, 0.3)`,
        },
        standardWarning: {
          background: `linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)`,
          color: modernColors.warning,
          border: `1px solid rgba(217, 119, 6, 0.3)`,
        },
        standardError: {
          background: `linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%)`,
          color: modernColors.error,
          border: `1px solid rgba(225, 29, 72, 0.3)`,
        },
        standardInfo: {
          background: `linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(56, 189, 248, 0.15) 100%)`,
          color: modernColors.info,
          border: `1px solid rgba(14, 165, 233, 0.3)`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: modernColors.void,
          fontFamily: modernFonts.body,
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
          border: '1px solid rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: modernColors.bgSecondary,
          '& .MuiTableCell-head': {
            color: modernColors.textSecondary,
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '10px 16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
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
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
          padding: '12px 16px',
        },
        body: {
          fontSize: '0.875rem',
          fontWeight: 400,
          color: modernColors.textPrimary,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: modernGradients.primary,
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            color: modernColors.primary,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: modernColors.bgSecondary,
          borderRadius: 4,
        },
        bar: {
          background: modernGradients.primary,
          borderRadius: 4,
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
