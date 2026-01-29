/**
 * Design System Page
 * Auto-generated design system from captured screens
 * Extracts colors, typography, spacing patterns from captured HTML
 */

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import {
  Palette,
  TextT,
  SquaresFour,
  ArrowsOutCardinal,
  Copy,
  ArrowClockwise,
  Check,
} from '@phosphor-icons/react';
import { useThemeStore } from '@/store/themeStore';
import { useScreensStore } from '@/store/screensStore';
import { useSnackbar } from '@/components/SnackbarProvider';

interface ExtractedColor {
  hex: string;
  rgb: string;
  count: number;
  usage: 'background' | 'text' | 'border' | 'accent';
}

interface ExtractedFont {
  family: string;
  weights: string[];
  sizes: string[];
  count: number;
}

interface ExtractedSpacing {
  value: string;
  count: number;
  context: string;
}

interface DesignSystemData {
  colors: ExtractedColor[];
  fonts: ExtractedFont[];
  spacing: ExtractedSpacing[];
  borderRadius: string[];
  shadows: string[];
  lastUpdated: string;
}

// Parse CSS color to hex
function normalizeColor(color: string): string | null {
  if (!color || color === 'transparent' || color === 'inherit' || color === 'initial') return null;

  // Already hex
  if (color.startsWith('#')) {
    return color.toLowerCase();
  }

  // RGB/RGBA
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  return null;
}

// Extract design tokens from HTML string
function extractDesignTokens(htmlStrings: string[]): DesignSystemData {
  const colorMap = new Map<string, { count: number; usage: ExtractedColor['usage'] }>();
  const fontMap = new Map<string, { weights: Set<string>; sizes: Set<string>; count: number }>();
  const spacingMap = new Map<string, { count: number; context: string }>();
  const borderRadiusSet = new Set<string>();
  const shadowSet = new Set<string>();

  htmlStrings.forEach((html) => {
    if (!html) return;

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract from inline styles and computed styles simulation
    const allElements = doc.querySelectorAll('*');

    allElements.forEach((el) => {
      const style = (el as HTMLElement).style;
      const computedStyle = el.getAttribute('style') || '';

      // Extract colors
      const colorProps = ['color', 'backgroundColor', 'borderColor', 'background'];
      colorProps.forEach((prop) => {
        const value = style.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (value) {
          const normalized = normalizeColor(value);
          if (normalized) {
            const existing = colorMap.get(normalized) || { count: 0, usage: 'text' as const };
            existing.count++;
            if (prop.includes('background') || prop.includes('Background')) existing.usage = 'background';
            if (prop.includes('border') || prop.includes('Border')) existing.usage = 'border';
            colorMap.set(normalized, existing);
          }
        }
      });

      // Extract from style attribute
      const bgMatch = computedStyle.match(/background(?:-color)?:\s*([^;]+)/i);
      if (bgMatch) {
        const normalized = normalizeColor(bgMatch[1].trim());
        if (normalized) {
          const existing = colorMap.get(normalized) || { count: 0, usage: 'background' as const };
          existing.count++;
          colorMap.set(normalized, existing);
        }
      }

      const colorMatch = computedStyle.match(/(?<!background-)color:\s*([^;]+)/i);
      if (colorMatch) {
        const normalized = normalizeColor(colorMatch[1].trim());
        if (normalized) {
          const existing = colorMap.get(normalized) || { count: 0, usage: 'text' as const };
          existing.count++;
          colorMap.set(normalized, existing);
        }
      }

      // Extract fonts
      const fontMatch = computedStyle.match(/font-family:\s*([^;]+)/i);
      if (fontMatch) {
        const family = fontMatch[1].split(',')[0].trim().replace(/['"]/g, '');
        const existing = fontMap.get(family) || { weights: new Set(), sizes: new Set(), count: 0 };
        existing.count++;

        const weightMatch = computedStyle.match(/font-weight:\s*(\d+|bold|normal)/i);
        if (weightMatch) existing.weights.add(weightMatch[1]);

        const sizeMatch = computedStyle.match(/font-size:\s*([^;]+)/i);
        if (sizeMatch) existing.sizes.add(sizeMatch[1].trim());

        fontMap.set(family, existing);
      }

      // Extract spacing (padding, margin)
      const spacingMatch = computedStyle.match(/(padding|margin):\s*([^;]+)/gi);
      if (spacingMatch) {
        spacingMatch.forEach((match) => {
          const [prop, value] = match.split(':').map((s) => s.trim());
          if (value && !value.includes('auto')) {
            const existing = spacingMap.get(value) || { count: 0, context: prop };
            existing.count++;
            spacingMap.set(value, existing);
          }
        });
      }

      // Extract border radius
      const radiusMatch = computedStyle.match(/border-radius:\s*([^;]+)/i);
      if (radiusMatch) {
        borderRadiusSet.add(radiusMatch[1].trim());
      }

      // Extract shadows
      const shadowMatch = computedStyle.match(/box-shadow:\s*([^;]+)/i);
      if (shadowMatch && shadowMatch[1] !== 'none') {
        shadowSet.add(shadowMatch[1].trim());
      }
    });
  });

  // Convert maps to arrays
  const colors: ExtractedColor[] = Array.from(colorMap.entries())
    .map(([hex, data]) => ({
      hex,
      rgb: `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})`,
      count: data.count,
      usage: data.usage,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const fonts: ExtractedFont[] = Array.from(fontMap.entries())
    .map(([family, data]) => ({
      family,
      weights: Array.from(data.weights),
      sizes: Array.from(data.sizes),
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const spacing: ExtractedSpacing[] = Array.from(spacingMap.entries())
    .map(([value, data]) => ({
      value,
      count: data.count,
      context: data.context,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    colors,
    fonts,
    spacing,
    borderRadius: Array.from(borderRadiusSet).slice(0, 10),
    shadows: Array.from(shadowSet).slice(0, 10),
    lastUpdated: new Date().toISOString(),
  };
}

// Color swatch component
function ColorSwatch({ color, onCopy }: { color: ExtractedColor; onCopy: (value: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    onCopy(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          height: 60,
          bgcolor: color.hex,
          position: 'relative',
          cursor: 'pointer',
          '&:hover .copy-btn': { opacity: 1 },
        }}
        onClick={handleCopy}
      >
        <IconButton
          className="copy-btn"
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            opacity: 0,
            transition: 'opacity 0.2s',
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'white' },
          }}
        >
          {copied ? <Check size={14} color="green" /> : <Copy size={14} />}
        </IconButton>
      </Box>
      <CardContent sx={{ py: 1, px: 1.5, '&:last-child': { pb: 1 } }}>
        <Typography variant="caption" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
          {color.hex}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Chip
            label={color.usage}
            size="small"
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            {color.count}x
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export const DesignSystem: React.FC = () => {
  const { config } = useThemeStore();
  const { screens, initializeScreens } = useScreensStore();
  const { showSuccess } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [designSystem, setDesignSystem] = useState<DesignSystemData | null>(null);

  // Initialize screens on mount
  useEffect(() => {
    if (screens.length === 0) {
      initializeScreens();
    }
  }, []);

  // Extract design system from screens
  const extractDesignSystem = async () => {
    setIsExtracting(true);
    try {
      // Simulate async processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      const htmlStrings = screens
        .filter((s) => s.editedHtml)
        .map((s) => s.editedHtml!);

      const data = extractDesignTokens(htmlStrings);
      setDesignSystem(data);
      showSuccess('Design system extracted successfully');
    } finally {
      setIsExtracting(false);
    }
  };

  // Auto-extract on mount if screens exist
  useEffect(() => {
    if (screens.length > 0 && !designSystem) {
      extractDesignSystem();
    }
  }, [screens.length]);

  const handleCopyToken = (value: string) => {
    showSuccess(`Copied: ${value}`);
  };

  const tabs = [
    { label: 'Colors', icon: <Palette size={18} /> },
    { label: 'Typography', icon: <TextT size={18} /> },
    { label: 'Spacing', icon: <ArrowsOutCardinal size={18} /> },
    { label: 'Components', icon: <SquaresFour size={18} /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ fontFamily: config.fonts.display }}>
            Design System
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Auto-generated from {screens.length} captured screens
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={isExtracting ? <CircularProgress size={16} /> : <ArrowClockwise size={18} />}
          onClick={extractDesignSystem}
          disabled={isExtracting || screens.length === 0}
        >
          {isExtracting ? 'Extracting...' : 'Refresh'}
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
        ))}
      </Tabs>

      {/* Content */}
      {!designSystem && !isExtracting && screens.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            No screens captured yet. Import screens to generate a design system.
          </Typography>
        </Box>
      )}

      {isExtracting && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {designSystem && !isExtracting && (
        <>
          {/* Colors Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Extracted Colors ({designSystem.colors.length})
              </Typography>
              <Grid container spacing={2}>
                {designSystem.colors.map((color, i) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={i}>
                    <ColorSwatch color={color} onCopy={handleCopyToken} />
                  </Grid>
                ))}
              </Grid>
              {designSystem.colors.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No colors extracted. Make sure screens have inline styles.
                </Typography>
              )}
            </Box>
          )}

          {/* Typography Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Font Families ({designSystem.fonts.length})
              </Typography>
              <Grid container spacing={2}>
                {designSystem.fonts.map((font, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{ fontFamily: font.family, mb: 1 }}
                        >
                          {font.family}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {font.weights.map((w) => (
                            <Chip key={w} label={`Weight: ${w}`} size="small" variant="outlined" />
                          ))}
                        </Box>
                        {font.sizes.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Sizes: {font.sizes.join(', ')}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {designSystem.fonts.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No fonts extracted from screens.
                </Typography>
              )}
            </Box>
          )}

          {/* Spacing Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Spacing Values ({designSystem.spacing.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {designSystem.spacing.map((sp, i) => (
                  <Card key={i} variant="outlined" sx={{ minWidth: 120 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                        {sp.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sp.context} ({sp.count}x)
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Border Radius ({designSystem.borderRadius.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {designSystem.borderRadius.map((radius, i) => (
                  <Card key={i} variant="outlined" sx={{ width: 80, height: 80 }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: config.colors.primary,
                          borderRadius: radius,
                          mb: 0.5,
                        }}
                      />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                        {radius}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Components Tab */}
          {activeTab === 3 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SquaresFour size={48} weight="light" color={config.colors.textSecondary} />
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Component Extraction Coming Soon
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                Automatic component detection and extraction from captured screens
                will be available in a future update.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default DesignSystem;
