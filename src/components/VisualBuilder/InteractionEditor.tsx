/**
 * Interaction Editor Panel
 * Defines interactions and behaviors for canvas elements
 * Supports click handlers, navigation, state changes, and animations
 */

import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import {
  Plus,
  Trash,
  CaretDown,
  CaretRight,
  CursorClick,
  ArrowSquareOut,
  Lightning,
  Eye,
  EyeSlash,
  Play,
  Timer,
  Warning,
  Check,
  X,
} from '@phosphor-icons/react';

import type { CanvasElement } from './VisualCanvas';

// ============================================================================
// Types
// ============================================================================

export type InteractionTrigger = 'click' | 'hover' | 'focus' | 'load' | 'scroll';
export type InteractionAction =
  | 'navigate'
  | 'showElement'
  | 'hideElement'
  | 'toggleElement'
  | 'openModal'
  | 'closeModal'
  | 'submitForm'
  | 'showToast'
  | 'playAnimation'
  | 'customCode';

export interface Interaction {
  id: string;
  name: string;
  trigger: InteractionTrigger;
  action: InteractionAction;
  config: InteractionConfig;
  enabled: boolean;
}

export interface InteractionConfig {
  // Navigate
  url?: string;
  openInNewTab?: boolean;
  // Show/Hide/Toggle Element
  targetElementId?: string;
  // Toast
  toastMessage?: string;
  toastType?: 'success' | 'error' | 'info' | 'warning';
  // Animation
  animationType?: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce';
  animationDuration?: number;
  animationDelay?: number;
  // Custom
  customCode?: string;
}

export interface InteractionEditorProps {
  element: CanvasElement | null;
  allElements: CanvasElement[];
  interactions: Interaction[];
  onInteractionsChange: (interactions: Interaction[]) => void;
}

// ============================================================================
// Constants
// ============================================================================

const TRIGGER_OPTIONS: { value: InteractionTrigger; label: string; icon: React.ReactNode }[] = [
  { value: 'click', label: 'On Click', icon: <CursorClick size={14} /> },
  { value: 'hover', label: 'On Hover', icon: <CursorClick size={14} /> },
  { value: 'focus', label: 'On Focus', icon: <CursorClick size={14} /> },
  { value: 'load', label: 'On Load', icon: <Play size={14} /> },
  { value: 'scroll', label: 'On Scroll', icon: <ArrowSquareOut size={14} /> },
];

const ACTION_OPTIONS: { value: InteractionAction; label: string; icon: React.ReactNode }[] = [
  { value: 'navigate', label: 'Navigate to URL', icon: <ArrowSquareOut size={14} /> },
  { value: 'showElement', label: 'Show Element', icon: <Eye size={14} /> },
  { value: 'hideElement', label: 'Hide Element', icon: <EyeSlash size={14} /> },
  { value: 'toggleElement', label: 'Toggle Element', icon: <Lightning size={14} /> },
  { value: 'openModal', label: 'Open Modal', icon: <Eye size={14} /> },
  { value: 'closeModal', label: 'Close Modal', icon: <X size={14} /> },
  { value: 'submitForm', label: 'Submit Form', icon: <Check size={14} /> },
  { value: 'showToast', label: 'Show Toast', icon: <Warning size={14} /> },
  { value: 'playAnimation', label: 'Play Animation', icon: <Play size={14} /> },
  { value: 'customCode', label: 'Custom Code', icon: <Lightning size={14} /> },
];

const ANIMATION_TYPES = ['fade', 'slide', 'scale', 'rotate', 'bounce'];
const TOAST_TYPES = ['success', 'error', 'info', 'warning'];

// ============================================================================
// Interaction Item Component
// ============================================================================

interface InteractionItemProps {
  interaction: Interaction;
  allElements: CanvasElement[];
  onUpdate: (updates: Partial<Interaction>) => void;
  onDelete: () => void;
}

function InteractionItem({ interaction, allElements, onUpdate, onDelete }: InteractionItemProps) {
  const [expanded, setExpanded] = useState(true);

  const triggerOption = TRIGGER_OPTIONS.find(t => t.value === interaction.trigger);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: interaction.enabled ? 'primary.main' : 'divider',
        borderRadius: 1,
        bgcolor: interaction.enabled ? 'primary.main' + '08' : 'background.paper',
        overflow: 'hidden',
        mb: 1,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" fontWeight={600}>
            {interaction.name || 'Unnamed Interaction'}
          </Typography>
          <Chip
            size="small"
            label={triggerOption?.label}
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
        </Box>
        <Tooltip title={interaction.enabled ? 'Disable' : 'Enable'}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ enabled: !interaction.enabled });
            }}
            sx={{ color: interaction.enabled ? 'primary.main' : 'text.disabled' }}
          >
            <Lightning size={14} weight={interaction.enabled ? 'fill' : 'regular'} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <Trash size={14} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 1.5, pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
          {/* Name */}
          <TextField
            fullWidth
            size="small"
            label="Name"
            value={interaction.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            sx={{ mb: 1.5 }}
            InputProps={{ sx: { fontSize: '0.75rem' } }}
          />

          {/* Trigger */}
          <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
            <InputLabel>Trigger</InputLabel>
            <Select
              value={interaction.trigger}
              label="Trigger"
              onChange={(e) => onUpdate({ trigger: e.target.value as InteractionTrigger })}
            >
              {TRIGGER_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {opt.icon}
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Action */}
          <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={interaction.action}
              label="Action"
              onChange={(e) => onUpdate({ action: e.target.value as InteractionAction })}
            >
              {ACTION_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {opt.icon}
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 1 }} />

          {/* Action-specific config */}
          {interaction.action === 'navigate' && (
            <>
              <TextField
                fullWidth
                size="small"
                label="URL"
                value={interaction.config.url || ''}
                onChange={(e) => onUpdate({ config: { ...interaction.config, url: e.target.value } })}
                placeholder="https://example.com"
                sx={{ mb: 1 }}
                InputProps={{ sx: { fontSize: '0.75rem' } }}
              />
              <Chip
                size="small"
                label={interaction.config.openInNewTab ? 'New Tab' : 'Same Tab'}
                onClick={() => onUpdate({
                  config: { ...interaction.config, openInNewTab: !interaction.config.openInNewTab }
                })}
                sx={{ cursor: 'pointer' }}
              />
            </>
          )}

          {(interaction.action === 'showElement' ||
            interaction.action === 'hideElement' ||
            interaction.action === 'toggleElement') && (
            <FormControl fullWidth size="small">
              <InputLabel>Target Element</InputLabel>
              <Select
                value={interaction.config.targetElementId || ''}
                label="Target Element"
                onChange={(e) => onUpdate({
                  config: { ...interaction.config, targetElementId: e.target.value }
                })}
              >
                {allElements.map((el) => (
                  <MenuItem key={el.id} value={el.id}>
                    {el.content.component?.name || `${el.type} - ${el.id.slice(0, 8)}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {interaction.action === 'showToast' && (
            <>
              <TextField
                fullWidth
                size="small"
                label="Message"
                value={interaction.config.toastMessage || ''}
                onChange={(e) => onUpdate({
                  config: { ...interaction.config, toastMessage: e.target.value }
                })}
                placeholder="Toast message..."
                sx={{ mb: 1 }}
                InputProps={{ sx: { fontSize: '0.75rem' } }}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={interaction.config.toastType || 'info'}
                  label="Type"
                  onChange={(e) => onUpdate({
                    config: { ...interaction.config, toastType: e.target.value as 'success' | 'error' | 'info' | 'warning' }
                  })}
                >
                  {TOAST_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {interaction.action === 'playAnimation' && (
            <>
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel>Animation</InputLabel>
                <Select
                  value={interaction.config.animationType || 'fade'}
                  label="Animation"
                  onChange={(e) => onUpdate({
                    config: { ...interaction.config, animationType: e.target.value as 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' }
                  })}
                >
                  {ANIMATION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  label="Duration (ms)"
                  value={interaction.config.animationDuration || 300}
                  onChange={(e) => onUpdate({
                    config: { ...interaction.config, animationDuration: Number(e.target.value) }
                  })}
                  sx={{ flex: 1 }}
                  InputProps={{ sx: { fontSize: '0.75rem' } }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Delay (ms)"
                  value={interaction.config.animationDelay || 0}
                  onChange={(e) => onUpdate({
                    config: { ...interaction.config, animationDelay: Number(e.target.value) }
                  })}
                  sx={{ flex: 1 }}
                  InputProps={{ sx: { fontSize: '0.75rem' } }}
                />
              </Box>
            </>
          )}

          {interaction.action === 'customCode' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              size="small"
              label="JavaScript Code"
              value={interaction.config.customCode || ''}
              onChange={(e) => onUpdate({
                config: { ...interaction.config, customCode: e.target.value }
              })}
              placeholder="// Custom JavaScript code"
              InputProps={{
                sx: {
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  bgcolor: '#1e293b',
                  color: '#e2e8f0',
                }
              }}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// ============================================================================
// Interaction Editor Component
// ============================================================================

export default function InteractionEditor({
  element,
  allElements,
  interactions,
  onInteractionsChange,
}: InteractionEditorProps) {

  const generateId = () => `interaction-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const handleAddInteraction = useCallback(() => {
    const newInteraction: Interaction = {
      id: generateId(),
      name: `Interaction ${interactions.length + 1}`,
      trigger: 'click',
      action: 'showToast',
      config: {
        toastMessage: 'Button clicked!',
        toastType: 'info',
      },
      enabled: true,
    };
    onInteractionsChange([...interactions, newInteraction]);
  }, [interactions, onInteractionsChange]);

  const handleUpdateInteraction = useCallback((id: string, updates: Partial<Interaction>) => {
    onInteractionsChange(
      interactions.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  }, [interactions, onInteractionsChange]);

  const handleDeleteInteraction = useCallback((id: string) => {
    onInteractionsChange(interactions.filter((i) => i.id !== id));
  }, [interactions, onInteractionsChange]);

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
        <Lightning size={48} color="#94a3b8" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No element selected
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Select an element on the canvas to add interactions
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Interactions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {element.content.component?.name || element.type}
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<Plus size={14} />}
            onClick={handleAddInteraction}
            sx={{ textTransform: 'none' }}
          >
            Add
          </Button>
        </Box>
      </Box>

      {/* Interactions List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {interactions.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <Timer size={32} color="#94a3b8" />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              No interactions defined
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Click "Add" to create your first interaction
            </Typography>
          </Box>
        ) : (
          interactions.map((interaction) => (
            <InteractionItem
              key={interaction.id}
              interaction={interaction}
              allElements={allElements}
              onUpdate={(updates) => handleUpdateInteraction(interaction.id, updates)}
              onDelete={() => handleDeleteInteraction(interaction.id)}
            />
          ))
        )}
      </Box>

      {/* Footer Tips */}
      {interactions.length > 0 && (
        <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Tip:</strong> Use the Preview mode to test your interactions live.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
