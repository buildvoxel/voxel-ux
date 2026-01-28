import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@mui/material/styles';
import { muiTheme, voxelColors, voxelFonts } from '@/theme/muiTheme';
import { modernGradientTheme, modernColors, modernFonts, modernGradients } from '@/theme/modernGradientTheme';

export type ThemeMode = 'craftsman' | 'modern';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  bgPrimary: string;
  bgSecondary: string;
  bgDark: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
}

interface ThemeFonts {
  display: string;
  body: string;
  mono: string;
}

interface ThemeConfig {
  name: string;
  description: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  muiTheme: Theme;
  backgroundStyle: 'grid' | 'mesh';
  gradients?: {
    primary: string;
    secondary: string;
    hero: string;
  };
}

// Craftsman theme config
const craftsmanConfig: ThemeConfig = {
  name: 'Craftsman',
  description: 'Precision meets warmth — Classic and refined',
  colors: {
    primary: voxelColors.primary,
    primaryLight: voxelColors.primaryLight,
    primaryDark: voxelColors.primaryDark,
    secondary: voxelColors.bgDark,
    bgPrimary: voxelColors.bgPrimary,
    bgSecondary: voxelColors.bgSecondary,
    bgDark: voxelColors.bgDark,
    surface: voxelColors.surface,
    textPrimary: voxelColors.textPrimary,
    textSecondary: voxelColors.textSecondary,
    border: voxelColors.border,
    success: voxelColors.success,
    successBg: voxelColors.successBg,
    warning: voxelColors.warning,
    warningBg: voxelColors.warningBg,
    error: voxelColors.error,
    errorBg: voxelColors.errorBg,
    info: voxelColors.info,
    infoBg: voxelColors.infoBg,
  },
  fonts: {
    display: voxelFonts.display,
    body: voxelFonts.body,
    mono: voxelFonts.mono,
  },
  muiTheme,
  backgroundStyle: 'grid',
};

// Modern Gradient theme config
const modernConfig: ThemeConfig = {
  name: 'Modern Gradient',
  description: 'Dynamic precision — Bold and vibrant',
  colors: {
    primary: modernColors.primary,
    primaryLight: modernColors.primaryLight,
    primaryDark: modernColors.primaryDark,
    secondary: modernColors.secondary,
    bgPrimary: modernColors.bgPrimary,
    bgSecondary: modernColors.bgSecondary,
    bgDark: modernColors.void,
    surface: modernColors.surface,
    textPrimary: modernColors.textPrimary,
    textSecondary: modernColors.textSecondary,
    border: modernColors.border,
    success: modernColors.success,
    successBg: modernColors.successBg,
    warning: modernColors.warning,
    warningBg: modernColors.warningBg,
    error: modernColors.error,
    errorBg: modernColors.errorBg,
    info: modernColors.info,
    infoBg: modernColors.infoBg,
  },
  fonts: {
    display: modernFonts.display,
    body: modernFonts.body,
    mono: modernFonts.mono,
  },
  muiTheme: modernGradientTheme,
  backgroundStyle: 'mesh',
  gradients: {
    primary: modernGradients.primary,
    secondary: modernGradients.violet,
    hero: modernGradients.hero,
  },
};

const themeConfigs: Record<ThemeMode, ThemeConfig> = {
  craftsman: craftsmanConfig,
  modern: modernConfig,
};

interface ThemeStore {
  mode: ThemeMode;
  config: ThemeConfig;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'craftsman',
      config: craftsmanConfig,
      setMode: (mode) => set({ mode, config: themeConfigs[mode] }),
      toggleMode: () => {
        const currentMode = get().mode;
        const newMode = currentMode === 'craftsman' ? 'modern' : 'craftsman';
        set({ mode: newMode, config: themeConfigs[newMode] });
      },
    }),
    {
      name: 'voxel-theme',
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.config = themeConfigs[state.mode];
        }
      },
    }
  )
);

// Helper hook to get current theme colors
export const useThemeColors = () => {
  const { config } = useThemeStore();
  return config.colors;
};

// Helper hook to get current theme fonts
export const useThemeFonts = () => {
  const { config } = useThemeStore();
  return config.fonts;
};

// Helper to get background style
export const useBackgroundStyle = () => {
  const { config } = useThemeStore();

  if (config.backgroundStyle === 'grid') {
    return {
      backgroundColor: config.colors.bgPrimary,
      backgroundImage: `
        linear-gradient(to right, ${config.colors.border}40 1px, transparent 1px),
        linear-gradient(to bottom, ${config.colors.border}40 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px',
    };
  } else {
    return {
      backgroundColor: config.colors.bgPrimary,
      backgroundImage: `
        radial-gradient(ellipse 80% 50% at 20% 40%, rgba(20, 184, 166, 0.15), transparent),
        radial-gradient(ellipse 60% 40% at 80% 20%, rgba(124, 58, 237, 0.12), transparent),
        radial-gradient(ellipse 50% 60% at 60% 80%, rgba(14, 165, 233, 0.10), transparent)
      `,
    };
  }
};
