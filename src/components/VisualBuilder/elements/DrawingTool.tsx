/**
 * Drawing Tool Component
 * Freehand SVG path editor for sketching and annotating
 * Supports multiple stroke colors, widths, and shapes
 */

import React, { useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Slider from '@mui/material/Slider';
import {
  PencilSimple,
  Eraser,
  ArrowCounterClockwise,
  ArrowClockwise,
  Trash,
  Circle,
  Square,
  Minus,
  ArrowRight,
} from '@phosphor-icons/react';

// ============================================================================
// Types
// ============================================================================

export type DrawingMode = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'arrow';

export interface Point {
  x: number;
  y: number;
}

export interface PathData {
  id: string;
  points: Point[];
  color: string;
  width: number;
  mode: DrawingMode;
}

export interface DrawingConfig {
  paths: PathData[];
  currentColor: string;
  currentWidth: number;
  mode: DrawingMode;
  backgroundColor?: string;
}

export interface DrawingToolProps {
  config: DrawingConfig;
  onConfigChange: (config: DrawingConfig) => void;
  width?: number | string;
  height?: number | string;
  editable?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const COLOR_PALETTE = [
  '#000000', // black
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#64748b', // slate
  '#ffffff', // white
];

export const createDefaultDrawingConfig = (): DrawingConfig => ({
  paths: [],
  currentColor: '#000000',
  currentWidth: 4,
  mode: 'pen',
  backgroundColor: 'transparent',
});

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(): string {
  return `path-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    path += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }

  // Last point
  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;

  return path;
}

function getShapePath(points: Point[], mode: DrawingMode): string {
  if (points.length < 2) return '';
  const start = points[0];
  const end = points[points.length - 1];
  const width = end.x - start.x;
  const height = end.y - start.y;

  switch (mode) {
    case 'line':
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    case 'rectangle':
      return `M ${start.x} ${start.y} L ${end.x} ${start.y} L ${end.x} ${end.y} L ${start.x} ${end.y} Z`;
    case 'circle': {
      const rx = Math.abs(width) / 2;
      const ry = Math.abs(height) / 2;
      const cx = start.x + width / 2;
      const cy = start.y + height / 2;
      return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
    }
    case 'arrow': {
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLength = 15;
      const headAngle = Math.PI / 6;
      const x1 = end.x - headLength * Math.cos(angle - headAngle);
      const y1 = end.y - headLength * Math.sin(angle - headAngle);
      const x2 = end.x - headLength * Math.cos(angle + headAngle);
      const y2 = end.y - headLength * Math.sin(angle + headAngle);
      return `M ${start.x} ${start.y} L ${end.x} ${end.y} M ${end.x} ${end.y} L ${x1} ${y1} M ${end.x} ${end.y} L ${x2} ${y2}`;
    }
    default:
      return pointsToSvgPath(points);
  }
}

// ============================================================================
// Drawing Canvas Component
// ============================================================================

function DrawingCanvas({
  config,
  onConfigChange,
  editable = true,
}: DrawingToolProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [history, setHistory] = useState<PathData[][]>([config.paths]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const getPointerPosition = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!editable) return;
    e.preventDefault();

    const point = getPointerPosition(e);
    setIsDrawing(true);
    setCurrentPath([point]);
  }, [editable, getPointerPosition]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !editable) return;
    e.preventDefault();

    const point = getPointerPosition(e);
    setCurrentPath(prev => [...prev, point]);
  }, [isDrawing, editable, getPointerPosition]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawing || currentPath.length === 0) return;

    const newPath: PathData = {
      id: generateId(),
      points: currentPath,
      color: config.mode === 'eraser' ? config.backgroundColor || '#ffffff' : config.currentColor,
      width: config.mode === 'eraser' ? config.currentWidth * 3 : config.currentWidth,
      mode: config.mode,
    };

    const newPaths = [...config.paths, newPath];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPaths);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onConfigChange({ ...config, paths: newPaths });
    setCurrentPath([]);
    setIsDrawing(false);
  }, [isDrawing, currentPath, config, history, historyIndex, onConfigChange]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onConfigChange({ ...config, paths: history[newIndex] });
    }
  }, [historyIndex, history, config, onConfigChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onConfigChange({ ...config, paths: history[newIndex] });
    }
  }, [historyIndex, history, config, onConfigChange]);

  const handleClear = useCallback(() => {
    const newHistory = [...history, []];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onConfigChange({ ...config, paths: [] });
  }, [history, config, onConfigChange]);

  // Render preview path
  const previewPath = currentPath.length > 0 ? (
    ['line', 'rectangle', 'circle', 'arrow'].includes(config.mode)
      ? getShapePath(currentPath, config.mode)
      : pointsToSvgPath(currentPath)
  ) : '';

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Toolbar */}
      {editable && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            gap: 0.5,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 2,
            p: 0.5,
            zIndex: 10,
          }}
        >
          {/* Drawing Mode */}
          <Tooltip title="Pen">
            <IconButton
              size="small"
              onClick={() => onConfigChange({ ...config, mode: 'pen' })}
              sx={{ bgcolor: config.mode === 'pen' ? 'action.selected' : 'transparent' }}
            >
              <PencilSimple size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Line">
            <IconButton
              size="small"
              onClick={() => onConfigChange({ ...config, mode: 'line' })}
              sx={{ bgcolor: config.mode === 'line' ? 'action.selected' : 'transparent' }}
            >
              <Minus size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rectangle">
            <IconButton
              size="small"
              onClick={() => onConfigChange({ ...config, mode: 'rectangle' })}
              sx={{ bgcolor: config.mode === 'rectangle' ? 'action.selected' : 'transparent' }}
            >
              <Square size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Circle">
            <IconButton
              size="small"
              onClick={() => onConfigChange({ ...config, mode: 'circle' })}
              sx={{ bgcolor: config.mode === 'circle' ? 'action.selected' : 'transparent' }}
            >
              <Circle size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Arrow">
            <IconButton
              size="small"
              onClick={() => onConfigChange({ ...config, mode: 'arrow' })}
              sx={{ bgcolor: config.mode === 'arrow' ? 'action.selected' : 'transparent' }}
            >
              <ArrowRight size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eraser">
            <IconButton
              size="small"
              onClick={() => onConfigChange({ ...config, mode: 'eraser' })}
              sx={{ bgcolor: config.mode === 'eraser' ? 'action.selected' : 'transparent' }}
            >
              <Eraser size={16} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: 1, bgcolor: 'divider', mx: 0.5 }} />

          {/* Undo/Redo */}
          <Tooltip title="Undo">
            <IconButton size="small" onClick={handleUndo} disabled={historyIndex === 0}>
              <ArrowCounterClockwise size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton size="small" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
              <ArrowClockwise size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear">
            <IconButton size="small" onClick={handleClear} sx={{ color: 'error.main' }}>
              <Trash size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Color Palette */}
      {editable && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            display: 'flex',
            gap: 0.5,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 2,
            p: 0.5,
            zIndex: 10,
          }}
        >
          {COLOR_PALETTE.map((color) => (
            <Box
              key={color}
              onClick={() => onConfigChange({ ...config, currentColor: color })}
              sx={{
                width: 20,
                height: 20,
                borderRadius: 0.5,
                bgcolor: color,
                border: '2px solid',
                borderColor: config.currentColor === color ? 'primary.main' : color === '#ffffff' ? 'divider' : 'transparent',
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            />
          ))}
        </Box>
      )}

      {/* Stroke Width */}
      {editable && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 100,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 2,
            p: 1,
            zIndex: 10,
          }}
        >
          <Slider
            size="small"
            value={config.currentWidth}
            onChange={(_, v) => onConfigChange({ ...config, currentWidth: v as number })}
            min={1}
            max={20}
            step={1}
          />
        </Box>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          cursor: editable ? (config.mode === 'eraser' ? 'crosshair' : 'crosshair') : 'default',
          backgroundColor: config.backgroundColor || 'transparent',
          touchAction: 'none',
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Existing paths */}
        {config.paths.map((pathData) => (
          <path
            key={pathData.id}
            d={
              ['line', 'rectangle', 'circle', 'arrow'].includes(pathData.mode)
                ? getShapePath(pathData.points, pathData.mode)
                : pointsToSvgPath(pathData.points)
            }
            fill={pathData.mode === 'rectangle' || pathData.mode === 'circle' ? 'none' : 'none'}
            stroke={pathData.color}
            strokeWidth={pathData.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Current drawing path */}
        {previewPath && (
          <path
            d={previewPath}
            fill="none"
            stroke={config.mode === 'eraser' ? config.backgroundColor || '#ffffff' : config.currentColor}
            strokeWidth={config.mode === 'eraser' ? config.currentWidth * 3 : config.currentWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={config.mode !== 'pen' && config.mode !== 'eraser' ? '5,5' : undefined}
          />
        )}
      </svg>
    </Box>
  );
}

// ============================================================================
// Main Drawing Tool Export
// ============================================================================

export default function DrawingTool(props: DrawingToolProps) {
  return (
    <Box
      sx={{
        width: props.width || '100%',
        height: props.height || '100%',
        bgcolor: 'background.paper',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <DrawingCanvas {...props} />
    </Box>
  );
}
