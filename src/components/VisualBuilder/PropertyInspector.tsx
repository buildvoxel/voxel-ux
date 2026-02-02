/**
 * Property Inspector Panel
 * Displays and edits properties of selected canvas elements
 * Supports component props, styles, and content slots
 */

import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import {
  CaretDown,
  CaretRight,
  Palette,
  TextT,
  ArrowsOutCardinal,
  Cube,
  Image as ImageIcon,
  ChartBar,
  Pencil,
  Trash,
  Copy,
  Eye,
  EyeSlash,
  LockSimple,
  LockSimpleOpen,
} from '@phosphor-icons/react';

import type { CanvasElement, CanvasElementContent } from './VisualCanvas';

// ============================================================================
// Types
// ============================================================================

export interface PropertyInspectorProps {
  element: CanvasElement | null;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onContentUpdate: (updates: Partial<CanvasElementContent>) => void;
  onStyleUpdate: (key: string, value: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

// ============================================================================
// Color Presets
// ============================================================================

const COLOR_PRESETS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#64748b',
  '#ffffff', '#f8fafc', '#e2e8f0', '#1e293b', '#0f172a',
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];
const FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800'];

// ============================================================================
// Collapsible Section Component
// ============================================================================

function Section({ title, icon, defaultExpanded = true, children }: SectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 1,
          px: 1.5,
          cursor: 'pointer',
          borderRadius: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        {expanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
        <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
        <Typography variant="caption" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

// ============================================================================
// Color Picker Component
// ============================================================================

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          onClick={() => setShowPresets(!showPresets)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: 0.5,
            bgcolor: value || '#ffffff',
            border: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <TextField
          size="small"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          sx={{ flex: 1 }}
          InputProps={{
            sx: { fontSize: '0.75rem', height: 28 },
          }}
        />
      </Box>
      <Collapse in={showPresets}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {COLOR_PRESETS.map((color) => (
            <Box
              key={color}
              onClick={() => {
                onChange(color);
                setShowPresets(false);
              }}
              sx={{
                width: 20,
                height: 20,
                borderRadius: 0.5,
                bgcolor: color,
                border: '1px solid',
                borderColor: value === color ? 'primary.main' : 'divider',
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

// ============================================================================
// Number Input with Slider
// ============================================================================

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function NumberInput({ label, value, onChange, min = 0, max = 1000, step = 1, unit }: NumberInputProps) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <TextField
          size="small"
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          InputProps={{
            sx: { fontSize: '0.75rem', height: 24, width: 70 },
            endAdornment: unit ? (
              <InputAdornment position="end">
                <Typography variant="caption" color="text.disabled">{unit}</Typography>
              </InputAdornment>
            ) : undefined,
          }}
          inputProps={{ min, max, step }}
        />
      </Box>
      <Slider
        size="small"
        value={value}
        onChange={(_, v) => onChange(v as number)}
        min={min}
        max={max}
        step={step}
        sx={{ mt: -0.5 }}
      />
    </Box>
  );
}

// ============================================================================
// Property Inspector Component
// ============================================================================

export default function PropertyInspector({
  element,
  onUpdate,
  onContentUpdate,
  onStyleUpdate,
  onDelete,
  onDuplicate,
}: PropertyInspectorProps) {

  const handlePositionChange = useCallback((key: 'x' | 'y', value: number) => {
    onUpdate({ [key]: value });
  }, [onUpdate]);

  const handleSizeChange = useCallback((key: 'width' | 'height', value: number) => {
    onUpdate({ [key]: value });
  }, [onUpdate]);

  const handleRotationChange = useCallback((value: number) => {
    onUpdate({ rotation: value });
  }, [onUpdate]);

  if (!element) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Cube size={48} color="#94a3b8" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No element selected
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Select an element on the canvas to edit its properties
        </Typography>
      </Box>
    );
  }

  const typeIcons: Record<CanvasElement['type'], React.ReactNode> = {
    component: <Cube size={16} />,
    text: <TextT size={16} />,
    shape: <Pencil size={16} />,
    image: <ImageIcon size={16} />,
    chart: <ChartBar size={16} />,
    drawing: <Pencil size={16} />,
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: 'primary.main' }}>{typeIcons[element.type]}</Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {element.content.component?.name || element.type.charAt(0).toUpperCase() + element.type.slice(1)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={element.visible ? 'Hide' : 'Show'}>
              <IconButton size="small" onClick={() => onUpdate({ visible: !element.visible })}>
                {element.visible ? <Eye size={16} /> : <EyeSlash size={16} />}
              </IconButton>
            </Tooltip>
            <Tooltip title={element.locked ? 'Unlock' : 'Lock'}>
              <IconButton size="small" onClick={() => onUpdate({ locked: !element.locked })}>
                {element.locked ? <LockSimple size={16} /> : <LockSimpleOpen size={16} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate">
              <IconButton size="small" onClick={onDuplicate}>
                <Copy size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main' }}>
                <Trash size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {element.content.component && (
          <Typography variant="caption" color="text.secondary">
            {element.content.component.type}
          </Typography>
        )}
      </Box>

      {/* Properties */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Transform Section */}
        <Section title="Transform" icon={<ArrowsOutCardinal size={14} />}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                X
              </Typography>
              <TextField
                size="small"
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => handlePositionChange('x', Number(e.target.value))}
                fullWidth
                InputProps={{ sx: { fontSize: '0.75rem', height: 28 } }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Y
              </Typography>
              <TextField
                size="small"
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                fullWidth
                InputProps={{ sx: { fontSize: '0.75rem', height: 28 } }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Width
              </Typography>
              <TextField
                size="small"
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => handleSizeChange('width', Number(e.target.value))}
                fullWidth
                InputProps={{ sx: { fontSize: '0.75rem', height: 28 } }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Height
              </Typography>
              <TextField
                size="small"
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => handleSizeChange('height', Number(e.target.value))}
                fullWidth
                InputProps={{ sx: { fontSize: '0.75rem', height: 28 } }}
              />
            </Box>
          </Box>
          <NumberInput
            label="Rotation"
            value={element.rotation}
            onChange={handleRotationChange}
            min={-180}
            max={180}
            step={1}
            unit="°"
          />
        </Section>

        <Divider />

        {/* Content Section - varies by type */}
        {element.type === 'text' && (
          <Section title="Text Content" icon={<TextT size={14} />}>
            <TextField
              multiline
              rows={3}
              fullWidth
              size="small"
              value={element.content.text || ''}
              onChange={(e) => onContentUpdate({ text: e.target.value })}
              placeholder="Enter text..."
              sx={{ mb: 1.5 }}
            />
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel>Font Size</InputLabel>
              <Select
                value={element.content.fontSize || 16}
                label="Font Size"
                onChange={(e) => onContentUpdate({ fontSize: Number(e.target.value) })}
              >
                {FONT_SIZES.map((size) => (
                  <MenuItem key={size} value={size}>{size}px</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Font Weight</InputLabel>
              <Select
                value={element.content.fontWeight || '400'}
                label="Font Weight"
                onChange={(e) => onContentUpdate({ fontWeight: e.target.value })}
              >
                {FONT_WEIGHTS.map((weight) => (
                  <MenuItem key={weight} value={weight}>{weight}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Section>
        )}

        {element.type === 'shape' && (
          <Section title="Shape" icon={<Pencil size={14} />}>
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel>Shape Type</InputLabel>
              <Select
                value={element.content.shapeType || 'rectangle'}
                label="Shape Type"
                onChange={(e) => onContentUpdate({ shapeType: e.target.value as 'rectangle' | 'circle' | 'line' | 'arrow' })}
              >
                <MenuItem value="rectangle">Rectangle</MenuItem>
                <MenuItem value="circle">Circle</MenuItem>
                <MenuItem value="line">Line</MenuItem>
                <MenuItem value="arrow">Arrow</MenuItem>
              </Select>
            </FormControl>
            <ColorPicker
              label="Fill Color"
              value={element.content.fill || '#3b82f6'}
              onChange={(v) => onContentUpdate({ fill: v })}
            />
            <ColorPicker
              label="Stroke Color"
              value={element.content.stroke || '#1e40af'}
              onChange={(v) => onContentUpdate({ stroke: v })}
            />
            <NumberInput
              label="Stroke Width"
              value={element.content.strokeWidth || 1}
              onChange={(v) => onContentUpdate({ strokeWidth: v })}
              min={0}
              max={20}
              step={1}
              unit="px"
            />
          </Section>
        )}

        {element.type === 'image' && (
          <Section title="Image" icon={<ImageIcon size={14} />}>
            <TextField
              fullWidth
              size="small"
              value={element.content.src || ''}
              onChange={(e) => onContentUpdate({ src: e.target.value })}
              placeholder="Image URL..."
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              size="small"
              value={element.content.alt || ''}
              onChange={(e) => onContentUpdate({ alt: e.target.value })}
              placeholder="Alt text..."
            />
          </Section>
        )}

        {element.type === 'component' && element.content.component && (
          <Section title="Component" icon={<Cube size={14} />}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Name
              </Typography>
              <Typography variant="body2">
                {element.content.component.name}
              </Typography>
            </Box>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Type
              </Typography>
              <Typography variant="body2">
                {element.content.component.type}
              </Typography>
            </Box>
            {element.content.component.props.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Props
                </Typography>
                {element.content.component.props.map((prop) => (
                  <Box key={prop.name} sx={{ mb: 1 }}>
                    {prop.type === 'boolean' ? (
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={prop.defaultValue === 'true'}
                            onChange={(e) => {
                              // Update prop in component - for now just log
                              console.log('Update prop:', prop.name, e.target.checked);
                            }}
                          />
                        }
                        label={<Typography variant="caption">{prop.name}</Typography>}
                      />
                    ) : prop.type === 'color' ? (
                      <ColorPicker
                        label={prop.name}
                        value={prop.defaultValue || '#000000'}
                        onChange={(v) => console.log('Update prop:', prop.name, v)}
                      />
                    ) : (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          {prop.name}
                        </Typography>
                        <TextField
                          size="small"
                          fullWidth
                          value={prop.defaultValue || ''}
                          placeholder={prop.type}
                          InputProps={{ sx: { fontSize: '0.75rem', height: 28 } }}
                          onChange={(e) => console.log('Update prop:', prop.name, e.target.value)}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Section>
        )}

        <Divider />

        {/* Style Section */}
        <Section title="Style" icon={<Palette size={14} />} defaultExpanded={false}>
          <ColorPicker
            label="Background"
            value={element.styles?.backgroundColor || 'transparent'}
            onChange={(v) => onStyleUpdate('backgroundColor', v)}
          />
          <ColorPicker
            label="Border Color"
            value={element.styles?.borderColor || 'transparent'}
            onChange={(v) => onStyleUpdate('borderColor', v)}
          />
          <NumberInput
            label="Border Width"
            value={parseInt(element.styles?.borderWidth || '0', 10)}
            onChange={(v) => onStyleUpdate('borderWidth', `${v}px`)}
            min={0}
            max={20}
            step={1}
            unit="px"
          />
          <NumberInput
            label="Border Radius"
            value={parseInt(element.styles?.borderRadius || '0', 10)}
            onChange={(v) => onStyleUpdate('borderRadius', `${v}px`)}
            min={0}
            max={50}
            step={1}
            unit="px"
          />
          <NumberInput
            label="Opacity"
            value={parseFloat(element.styles?.opacity || '1') * 100}
            onChange={(v) => onStyleUpdate('opacity', String(v / 100))}
            min={0}
            max={100}
            step={5}
            unit="%"
          />
        </Section>

        <Divider />

        {/* Layer Section */}
        <Section title="Layer" icon={<Cube size={14} />} defaultExpanded={false}>
          <NumberInput
            label="Z-Index"
            value={element.zIndex}
            onChange={(v) => onUpdate({ zIndex: v })}
            min={0}
            max={100}
            step={1}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={element.visible}
                onChange={(e) => onUpdate({ visible: e.target.checked })}
              />
            }
            label={<Typography variant="caption">Visible</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={element.locked}
                onChange={(e) => onUpdate({ locked: e.target.checked })}
              />
            }
            label={<Typography variant="caption">Locked</Typography>}
          />
        </Section>
      </Box>
    </Box>
  );
}
