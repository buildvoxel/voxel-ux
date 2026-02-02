/**
 * Visual Canvas Component
 * Drag-and-drop canvas for building prototypes visually
 * Features: Layer management, zoom/pan, grid snapping, selection
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Slider from '@mui/material/Slider';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  ArrowsOutCardinal,
  GridFour,
  Trash,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeSlash,
  LockSimple,
  LockSimpleOpen,
  CornersOut,
} from '@phosphor-icons/react';

import type { ExtractedComponent } from '@/services/visualBuilder/componentExtractor';

// ============================================================================
// Types
// ============================================================================

export interface CanvasElement {
  id: string;
  type: 'component' | 'text' | 'shape' | 'image' | 'chart' | 'drawing';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  content: CanvasElementContent;
  styles?: Record<string, string>;
}

export interface CanvasElementContent {
  // For components
  component?: ExtractedComponent;
  html?: string;
  // For text
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  // For shapes
  shapeType?: 'rectangle' | 'circle' | 'line' | 'arrow';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  // For images
  src?: string;
  alt?: string;
  // For charts
  chartType?: string;
  chartData?: unknown;
}

export interface VisualCanvasProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onElementsChange: (elements: CanvasElement[]) => void;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onElementDelete: (id: string) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const DEFAULT_GRID_SIZE = 20;

// ============================================================================
// Helper Functions
// ============================================================================

function snapToGridValue(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
}

// ============================================================================
// Canvas Element Renderer
// ============================================================================

interface CanvasElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  zoom: number;
}

function CanvasElementRenderer({
  element,
  isSelected,
  onSelect,
  zoom: _zoom,
}: CanvasElementRendererProps) {
  if (!element.visible) return null;

  const renderContent = () => {
    switch (element.type) {
      case 'component':
        if (element.content.html) {
          return (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: element.locked ? 'none' : 'auto',
              }}
              dangerouslySetInnerHTML={{ __html: element.content.html }}
            />
          );
        }
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f5f5f5',
              border: '1px dashed #ccc',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {element.content.component?.name || 'Component'}
            </Typography>
          </Box>
        );

      case 'text':
        return (
          <Typography
            sx={{
              fontSize: element.content.fontSize || 16,
              fontWeight: element.content.fontWeight || 'normal',
              color: element.styles?.color || '#000',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {element.content.text || 'Text'}
          </Typography>
        );

      case 'shape':
        const { shapeType, fill, stroke, strokeWidth } = element.content;
        if (shapeType === 'circle') {
          return (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                bgcolor: fill || '#e0e0e0',
                border: stroke ? `${strokeWidth || 1}px solid ${stroke}` : 'none',
              }}
            />
          );
        }
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: fill || '#e0e0e0',
              border: stroke ? `${strokeWidth || 1}px solid ${stroke}` : 'none',
              borderRadius: 1,
            }}
          />
        );

      case 'image':
        return (
          <Box
            component="img"
            src={element.content.src || 'https://via.placeholder.com/150'}
            alt={element.content.alt || 'Image'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        );

      default:
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption">{element.type}</Typography>
          </Box>
        );
    }
  };

  return (
    <Box
      onClick={e => {
        e.stopPropagation();
        if (!element.locked) onSelect();
      }}
      sx={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        zIndex: element.zIndex,
        cursor: element.locked ? 'not-allowed' : 'move',
        outline: isSelected ? '2px solid #3b82f6' : 'none',
        outlineOffset: 2,
        opacity: element.locked ? 0.7 : 1,
        transition: 'outline 0.1s ease',
        '&:hover': {
          outline: isSelected ? '2px solid #3b82f6' : '1px solid #94a3b8',
        },
        ...element.styles,
      }}
    >
      {renderContent()}

      {/* Selection handles */}
      {isSelected && !element.locked && (
        <>
          {/* Corner handles */}
          {['nw', 'ne', 'se', 'sw'].map(corner => (
            <Box
              key={corner}
              sx={{
                position: 'absolute',
                width: 8,
                height: 8,
                bgcolor: '#3b82f6',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: `${corner}-resize`,
                ...(corner.includes('n') ? { top: -4 } : { bottom: -4 }),
                ...(corner.includes('w') ? { left: -4 } : { right: -4 }),
              }}
            />
          ))}
          {/* Edge handles */}
          {['n', 'e', 's', 'w'].map(edge => (
            <Box
              key={edge}
              sx={{
                position: 'absolute',
                width: edge === 'n' || edge === 's' ? '50%' : 6,
                height: edge === 'e' || edge === 'w' ? '50%' : 6,
                bgcolor: '#3b82f6',
                border: '1px solid white',
                borderRadius: 1,
                cursor: `${edge}-resize`,
                ...(edge === 'n' && { top: -3, left: '25%' }),
                ...(edge === 's' && { bottom: -3, left: '25%' }),
                ...(edge === 'e' && { right: -3, top: '25%' }),
                ...(edge === 'w' && { left: -3, top: '25%' }),
              }}
            />
          ))}
        </>
      )}
    </Box>
  );
}

// ============================================================================
// Droppable Canvas Area
// ============================================================================

interface DroppableCanvasProps {
  children: React.ReactNode;
  canvasState: CanvasState;
  canvasWidth: number;
  canvasHeight: number;
  onPan: (deltaX: number, deltaY: number) => void;
  onDeselect: () => void;
}

function DroppableCanvas({
  children,
  canvasState,
  canvasWidth,
  canvasHeight,
  onPan,
  onDeselect,
}: DroppableCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  const isPanning = useRef(false);
  const lastPanPosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+click for panning
      isPanning.current = true;
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      const deltaX = e.clientX - lastPanPosition.current.x;
      const deltaY = e.clientY - lastPanPosition.current.y;
      onPan(deltaX, deltaY);
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isPanning.current = false;
  };

  return (
    <Box
      ref={setNodeRef}
      onClick={onDeselect}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      sx={{
        position: 'relative',
        width: canvasWidth,
        height: canvasHeight,
        bgcolor: '#ffffff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: 1,
        overflow: 'hidden',
        transform: `scale(${canvasState.zoom}) translate(${canvasState.panX}px, ${canvasState.panY}px)`,
        transformOrigin: 'center center',
        transition: isPanning.current ? 'none' : 'transform 0.1s ease',
        outline: isOver ? '2px dashed #3b82f6' : 'none',
      }}
    >
      {/* Grid overlay */}
      {canvasState.showGrid && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: `${canvasState.gridSize}px ${canvasState.gridSize}px`,
            pointerEvents: 'none',
            opacity: 0.5,
          }}
        />
      )}

      {children}
    </Box>
  );
}

// ============================================================================
// Canvas Toolbar
// ============================================================================

interface CanvasToolbarProps {
  canvasState: CanvasState;
  selectedElement: CanvasElement | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (zoom: number) => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onResetView: () => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onToggleLock: () => void;
  onToggleVisibility: () => void;
}

function CanvasToolbar({
  canvasState,
  selectedElement,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  onToggleGrid,
  onToggleSnap,
  onResetView,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onToggleLock,
  onToggleVisibility,
}: CanvasToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Zoom controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton size="small" onClick={onZoomOut} disabled={canvasState.zoom <= MIN_ZOOM}>
          <MagnifyingGlassMinus size={18} />
        </IconButton>
        <Slider
          value={canvasState.zoom}
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={ZOOM_STEP}
          onChange={(_, value) => onZoomChange(value as number)}
          sx={{ width: 100 }}
          size="small"
        />
        <IconButton size="small" onClick={onZoomIn} disabled={canvasState.zoom >= MAX_ZOOM}>
          <MagnifyingGlassPlus size={18} />
        </IconButton>
        <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
          {Math.round(canvasState.zoom * 100)}%
        </Typography>
      </Box>

      <Box sx={{ width: 1, height: 24, bgcolor: 'divider' }} />

      {/* View controls */}
      <Tooltip title="Reset View">
        <IconButton size="small" onClick={onResetView}>
          <CornersOut size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title={canvasState.showGrid ? 'Hide Grid' : 'Show Grid'}>
        <IconButton
          size="small"
          onClick={onToggleGrid}
          sx={{ bgcolor: canvasState.showGrid ? 'action.selected' : 'transparent' }}
        >
          <GridFour size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title={canvasState.snapToGrid ? 'Disable Snap' : 'Enable Snap'}>
        <IconButton
          size="small"
          onClick={onToggleSnap}
          sx={{ bgcolor: canvasState.snapToGrid ? 'action.selected' : 'transparent' }}
        >
          <ArrowsOutCardinal size={18} />
        </IconButton>
      </Tooltip>

      {selectedElement && (
        <>
          <Box sx={{ width: 1, height: 24, bgcolor: 'divider' }} />

          {/* Element controls */}
          <Tooltip title="Bring Forward">
            <IconButton size="small" onClick={onBringForward}>
              <ArrowUp size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Backward">
            <IconButton size="small" onClick={onSendBackward}>
              <ArrowDown size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title={selectedElement.locked ? 'Unlock' : 'Lock'}>
            <IconButton size="small" onClick={onToggleLock}>
              {selectedElement.locked ? <LockSimple size={18} /> : <LockSimpleOpen size={18} />}
            </IconButton>
          </Tooltip>
          <Tooltip title={selectedElement.visible ? 'Hide' : 'Show'}>
            <IconButton size="small" onClick={onToggleVisibility}>
              {selectedElement.visible ? <Eye size={18} /> : <EyeSlash size={18} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton size="small" onClick={onDuplicateElement}>
              <Copy size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={onDeleteElement} color="error">
              <Trash size={18} />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
  );
}

// ============================================================================
// Main Visual Canvas Component
// ============================================================================

export default function VisualCanvas({
  elements,
  selectedId,
  onSelect,
  onElementsChange,
  onElementUpdate,
  onElementDelete,
  canvasWidth = 1200,
  canvasHeight = 800,
}: VisualCanvasProps) {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    showGrid: true,
    gridSize: DEFAULT_GRID_SIZE,
    snapToGrid: true,
  });

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const selectedElement = selectedId
    ? elements.find(el => el.id === selectedId) || null
    : null;

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, prev.zoom - ZOOM_STEP),
    }));
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setCanvasState(prev => ({ ...prev, zoom }));
  }, []);

  const handleResetView = useCallback(() => {
    setCanvasState(prev => ({ ...prev, zoom: 1, panX: 0, panY: 0 }));
  }, []);

  const handleToggleGrid = useCallback(() => {
    setCanvasState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const handleToggleSnap = useCallback(() => {
    setCanvasState(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  }, []);

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setCanvasState(prev => ({
      ...prev,
      panX: prev.panX + deltaX / prev.zoom,
      panY: prev.panY + deltaY / prev.zoom,
    }));
  }, []);

  // Element handlers
  const handleDeleteElement = useCallback(() => {
    if (selectedId) {
      onElementDelete(selectedId);
      onSelect(null);
    }
  }, [selectedId, onElementDelete, onSelect]);

  const handleDuplicateElement = useCallback(() => {
    if (selectedElement) {
      const newElement: CanvasElement = {
        ...selectedElement,
        id: `${selectedElement.id}-copy-${Date.now()}`,
        x: selectedElement.x + 20,
        y: selectedElement.y + 20,
        zIndex: Math.max(...elements.map(el => el.zIndex)) + 1,
      };
      onElementsChange([...elements, newElement]);
      onSelect(newElement.id);
    }
  }, [selectedElement, elements, onElementsChange, onSelect]);

  const handleBringForward = useCallback(() => {
    if (selectedElement) {
      const maxZ = Math.max(...elements.map(el => el.zIndex));
      onElementUpdate(selectedElement.id, { zIndex: maxZ + 1 });
    }
  }, [selectedElement, elements, onElementUpdate]);

  const handleSendBackward = useCallback(() => {
    if (selectedElement) {
      const minZ = Math.min(...elements.map(el => el.zIndex));
      onElementUpdate(selectedElement.id, { zIndex: Math.max(0, minZ - 1) });
    }
  }, [selectedElement, elements, onElementUpdate]);

  const handleToggleLock = useCallback(() => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, { locked: !selectedElement.locked });
    }
  }, [selectedElement, onElementUpdate]);

  const handleToggleVisibility = useCallback(() => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, { visible: !selectedElement.visible });
    }
  }, [selectedElement, onElementUpdate]);

  // DnD handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveDragId(null);

    if (!over) return;

    // Handle dropping from component library
    if (active.data.current?.type === 'component' && over.id === 'canvas') {
      const component = active.data.current.component as ExtractedComponent;
      const newElement: CanvasElement = {
        id: `canvas-${component.id}-${Date.now()}`,
        type: 'component',
        x: snapToGridValue(100, canvasState.gridSize, canvasState.snapToGrid),
        y: snapToGridValue(100, canvasState.gridSize, canvasState.snapToGrid),
        width: 200,
        height: 150,
        rotation: 0,
        zIndex: elements.length,
        locked: false,
        visible: true,
        content: {
          component,
          html: component.html,
        },
      };
      onElementsChange([...elements, newElement]);
      onSelect(newElement.id);
      return;
    }

    // Handle moving existing element
    const existingElement = elements.find(el => el.id === active.id);
    if (existingElement && !existingElement.locked) {
      const newX = snapToGridValue(
        existingElement.x + delta.x / canvasState.zoom,
        canvasState.gridSize,
        canvasState.snapToGrid
      );
      const newY = snapToGridValue(
        existingElement.y + delta.y / canvasState.zoom,
        canvasState.gridSize,
        canvasState.snapToGrid
      );
      onElementUpdate(existingElement.id, { x: newX, y: newY });
    }
  }, [elements, canvasState, onElementsChange, onElementUpdate, onSelect]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && !selectedElement?.locked) {
          handleDeleteElement();
        }
      }
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleDuplicateElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedElement, handleDeleteElement, handleDuplicateElement]);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setCanvasState(prev => ({
          ...prev,
          zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.zoom + delta)),
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CanvasToolbar
        canvasState={canvasState}
        selectedElement={selectedElement}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomChange={handleZoomChange}
        onToggleGrid={handleToggleGrid}
        onToggleSnap={handleToggleSnap}
        onResetView={handleResetView}
        onDeleteElement={handleDeleteElement}
        onDuplicateElement={handleDuplicateElement}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onToggleLock={handleToggleLock}
        onToggleVisibility={handleToggleVisibility}
      />

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: 'hidden',
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <DroppableCanvas
            canvasState={canvasState}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onPan={handlePan}
            onDeselect={() => onSelect(null)}
          >
            {elements.map(element => (
              <CanvasElementRenderer
                key={element.id}
                element={element}
                isSelected={selectedId === element.id}
                onSelect={() => onSelect(element.id)}
                zoom={canvasState.zoom}
              />
            ))}
          </DroppableCanvas>

          <DragOverlay>
            {activeDragId && (
              <Box
                sx={{
                  width: 100,
                  height: 60,
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  border: '2px dashed #3b82f6',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" color="primary">
                  Drop here
                </Typography>
              </Box>
            )}
          </DragOverlay>
        </DndContext>
      </Box>
    </Box>
  );
}
