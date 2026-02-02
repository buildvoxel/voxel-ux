/**
 * Animation Element Component
 * Supports Lottie animations and CSS-based animations
 * Includes preset animations for common UI patterns
 */

import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Play, Pause, ArrowClockwise } from '@phosphor-icons/react';
import Lottie from 'lottie-react';

// ============================================================================
// Types
// ============================================================================

export type AnimationType = 'lottie' | 'css' | 'preset';
export type CSSAnimationPreset =
  | 'fade-in'
  | 'fade-out'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-up'
  | 'scale-down'
  | 'rotate'
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'flip'
  | 'swing';

export interface AnimationConfig {
  type: AnimationType;
  // Lottie
  lottieData?: object;
  lottieUrl?: string;
  // CSS
  cssPreset?: CSSAnimationPreset;
  customKeyframes?: string;
  // Common settings
  duration: number;
  delay: number;
  iterations: number | 'infinite';
  easing: string;
  autoplay: boolean;
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export interface AnimationElementProps {
  config: AnimationConfig;
  onConfigChange?: (config: AnimationConfig) => void;
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
}

// ============================================================================
// CSS Animation Keyframes
// ============================================================================

const CSS_ANIMATIONS: Record<CSSAnimationPreset, string> = {
  'fade-in': `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  'fade-out': `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  'slide-up': `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  'slide-down': `
    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `,
  'slide-left': `
    @keyframes slideLeft {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,
  'slide-right': `
    @keyframes slideRight {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,
  'scale-up': `
    @keyframes scaleUp {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
  'scale-down': `
    @keyframes scaleDown {
      from { transform: scale(1.5); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
  'rotate': `
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  'bounce': `
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-30px); }
      60% { transform: translateY(-15px); }
    }
  `,
  'pulse': `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `,
  'shake': `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
      20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
  `,
  'flip': `
    @keyframes flip {
      from { transform: perspective(400px) rotateY(0); }
      to { transform: perspective(400px) rotateY(360deg); }
    }
  `,
  'swing': `
    @keyframes swing {
      20% { transform: rotate(15deg); }
      40% { transform: rotate(-10deg); }
      60% { transform: rotate(5deg); }
      80% { transform: rotate(-5deg); }
      100% { transform: rotate(0deg); }
    }
  `,
};

const ANIMATION_NAMES: Record<CSSAnimationPreset, string> = {
  'fade-in': 'fadeIn',
  'fade-out': 'fadeOut',
  'slide-up': 'slideUp',
  'slide-down': 'slideDown',
  'slide-left': 'slideLeft',
  'slide-right': 'slideRight',
  'scale-up': 'scaleUp',
  'scale-down': 'scaleDown',
  'rotate': 'rotate',
  'bounce': 'bounce',
  'pulse': 'pulse',
  'shake': 'shake',
  'flip': 'flip',
  'swing': 'swing',
};

const EASING_OPTIONS = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // elastic
];

// ============================================================================
// Default Config
// ============================================================================

export const createDefaultAnimationConfig = (): AnimationConfig => ({
  type: 'css',
  cssPreset: 'fade-in',
  duration: 500,
  delay: 0,
  iterations: 1,
  easing: 'ease-out',
  autoplay: true,
  direction: 'normal',
});

// ============================================================================
// Sample Lottie Animations (URLs to free Lottie files)
// ============================================================================

export const SAMPLE_LOTTIE_URLS = [
  { label: 'Loading Spinner', url: 'https://lottie.host/embed/f2d2e81c-8e0e-4d1c-9f95-d1c2f5e7d51e/Rg8y7g5Z8X.json' },
  { label: 'Success Check', url: 'https://lottie.host/embed/2b14e2cf-d5ce-4f4e-a4f3-4e9d4b8c3e8f/aD8dK5s9dA.json' },
  { label: 'Error X', url: 'https://lottie.host/embed/d3c8e5f2-b9a4-4c1e-8f7d-9e6a3b2c1d0e/kL9m2n3o4P.json' },
];

// ============================================================================
// CSS Animation Wrapper
// ============================================================================

function CSSAnimationWrapper({
  config,
  children,
  isPlaying,
  restartKey,
}: {
  config: AnimationConfig;
  children?: React.ReactNode;
  isPlaying: boolean;
  restartKey: number;
}) {
  const keyframes = config.cssPreset ? CSS_ANIMATIONS[config.cssPreset] : config.customKeyframes || '';
  const animationName = config.cssPreset ? ANIMATION_NAMES[config.cssPreset] : 'customAnimation';

  const styleId = `anim-style-${animationName}-${restartKey}`;

  useEffect(() => {
    // Inject keyframes into head
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = keyframes;

    return () => {
      styleEl?.remove();
    };
  }, [keyframes, styleId]);

  const animationStyle: React.CSSProperties = isPlaying
    ? {
        animation: `${animationName} ${config.duration}ms ${config.easing} ${config.delay}ms ${
          config.iterations === 'infinite' ? 'infinite' : config.iterations
        } ${config.direction}`,
        animationFillMode: 'forwards',
      }
    : {};

  return (
    <Box key={restartKey} sx={{ ...animationStyle, width: '100%', height: '100%' }}>
      {children || (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            bgcolor: 'primary.main',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Typography variant="h6">Animated Element</Typography>
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// Lottie Animation Wrapper
// ============================================================================

function LottieAnimationWrapper({
  config,
  isPlaying,
}: {
  config: AnimationConfig;
  isPlaying: boolean;
}) {
  const [animationData, setAnimationData] = useState<object | null>(config.lottieData || null);
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (config.lottieUrl && !config.lottieData) {
      fetch(config.lottieUrl)
        .then((res) => res.json())
        .then((data) => setAnimationData(data))
        .catch((err) => console.error('Failed to load Lottie animation:', err));
    }
  }, [config.lottieUrl, config.lottieData]);

  useEffect(() => {
    if (lottieRef.current) {
      if (isPlaying) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isPlaying]);

  if (!animationData) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {config.lottieUrl ? 'Loading Lottie...' : 'No Lottie data'}
        </Typography>
      </Box>
    );
  }

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={config.iterations === 'infinite'}
      autoplay={config.autoplay && isPlaying}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ============================================================================
// Animation Element Component
// ============================================================================

export default function AnimationElement({
  config,
  onConfigChange: _onConfigChange,
  width = '100%',
  height = '100%',
  children,
}: AnimationElementProps) {
  const [isPlaying, setIsPlaying] = useState(config.autoplay);
  const [restartKey, setRestartKey] = useState(0);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleRestart = () => {
    setRestartKey((k) => k + 1);
    setIsPlaying(true);
  };

  return (
    <Box
      sx={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1,
      }}
    >
      {/* Animation Content */}
      <Box sx={{ width: '100%', height: '100%' }}>
        {config.type === 'lottie' ? (
          <LottieAnimationWrapper config={config} isPlaying={isPlaying} />
        ) : (
          <CSSAnimationWrapper
            config={config}
            isPlaying={isPlaying}
            restartKey={restartKey}
          >
            {children}
          </CSSAnimationWrapper>
        )}
      </Box>

      {/* Playback Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 0.5,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 2,
          p: 0.5,
        }}
      >
        <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
          <IconButton size="small" onClick={isPlaying ? handlePause : handlePlay}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Restart">
          <IconButton size="small" onClick={handleRestart}>
            <ArrowClockwise size={16} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ============================================================================
// Animation Config Editor (for Property Inspector)
// ============================================================================

export function AnimationConfigEditor({
  config,
  onConfigChange,
}: {
  config: AnimationConfig;
  onConfigChange: (config: AnimationConfig) => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Animation Type */}
      <FormControl fullWidth size="small">
        <InputLabel>Type</InputLabel>
        <Select
          value={config.type}
          label="Type"
          onChange={(e) => onConfigChange({ ...config, type: e.target.value as AnimationType })}
        >
          <MenuItem value="css">CSS Animation</MenuItem>
          <MenuItem value="lottie">Lottie Animation</MenuItem>
        </Select>
      </FormControl>

      {/* CSS Preset */}
      {config.type === 'css' && (
        <FormControl fullWidth size="small">
          <InputLabel>Preset</InputLabel>
          <Select
            value={config.cssPreset || 'fade-in'}
            label="Preset"
            onChange={(e) => onConfigChange({ ...config, cssPreset: e.target.value as CSSAnimationPreset })}
          >
            {Object.keys(CSS_ANIMATIONS).map((preset) => (
              <MenuItem key={preset} value={preset}>
                {preset.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Lottie URL */}
      {config.type === 'lottie' && (
        <TextField
          fullWidth
          size="small"
          label="Lottie URL"
          value={config.lottieUrl || ''}
          onChange={(e) => onConfigChange({ ...config, lottieUrl: e.target.value })}
          placeholder="https://..."
        />
      )}

      {/* Duration */}
      <Box>
        <Typography variant="caption" color="text.secondary">
          Duration: {config.duration}ms
        </Typography>
        <Slider
          size="small"
          value={config.duration}
          onChange={(_, v) => onConfigChange({ ...config, duration: v as number })}
          min={100}
          max={3000}
          step={100}
        />
      </Box>

      {/* Delay */}
      <Box>
        <Typography variant="caption" color="text.secondary">
          Delay: {config.delay}ms
        </Typography>
        <Slider
          size="small"
          value={config.delay}
          onChange={(_, v) => onConfigChange({ ...config, delay: v as number })}
          min={0}
          max={2000}
          step={100}
        />
      </Box>

      {/* Easing */}
      <FormControl fullWidth size="small">
        <InputLabel>Easing</InputLabel>
        <Select
          value={config.easing}
          label="Easing"
          onChange={(e) => onConfigChange({ ...config, easing: e.target.value })}
        >
          {EASING_OPTIONS.map((easing) => (
            <MenuItem key={easing} value={easing}>
              {easing.startsWith('cubic') ? 'Elastic' : easing}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Direction */}
      <FormControl fullWidth size="small">
        <InputLabel>Direction</InputLabel>
        <Select
          value={config.direction}
          label="Direction"
          onChange={(e) => onConfigChange({ ...config, direction: e.target.value as AnimationConfig['direction'] })}
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="reverse">Reverse</MenuItem>
          <MenuItem value="alternate">Alternate</MenuItem>
          <MenuItem value="alternate-reverse">Alternate Reverse</MenuItem>
        </Select>
      </FormControl>

      {/* Iterations */}
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={config.iterations === 'infinite'}
            onChange={(e) => onConfigChange({ ...config, iterations: e.target.checked ? 'infinite' : 1 })}
          />
        }
        label={<Typography variant="caption">Loop Infinite</Typography>}
      />

      {/* Autoplay */}
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={config.autoplay}
            onChange={(e) => onConfigChange({ ...config, autoplay: e.target.checked })}
          />
        }
        label={<Typography variant="caption">Autoplay</Typography>}
      />
    </Box>
  );
}
