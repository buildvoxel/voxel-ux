/**
 * Visual Builder Page
 * Main entry point for the drag-and-drop visual builder
 * Combines canvas, component library, property inspector, and interactions
 */

import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {
  Sidebar as SidebarIcon,
  SlidersHorizontal,
  Lightning,
  Upload,
  TextT,
  Square,
  Image as ImageIcon,
  ChartBar,
  Pencil,
} from '@phosphor-icons/react';

import VisualCanvas from '@/components/VisualBuilder/VisualCanvas';
import ComponentLibrary from '@/components/VisualBuilder/ComponentLibrary';
import PropertyInspector from '@/components/VisualBuilder/PropertyInspector';
import InteractionEditor from '@/components/VisualBuilder/InteractionEditor';
import ExportPreview from '@/components/VisualBuilder/ExportPreview';
import { extractComponents } from '@/services/visualBuilder/componentExtractor';

import type { CanvasElement, CanvasElementContent } from '@/components/VisualBuilder/VisualCanvas';
import type { Interaction } from '@/components/VisualBuilder/InteractionEditor';
import type { ExtractionResult } from '@/services/visualBuilder/componentExtractor';

// ============================================================================
// Types
// ============================================================================

type RightPanelTab = 'properties' | 'interactions';

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `element-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createDefaultElement(type: CanvasElement['type'], x: number, y: number): CanvasElement {
  const baseElement: Omit<CanvasElement, 'content'> = {
    id: generateId(),
    type,
    x,
    y,
    width: 200,
    height: type === 'text' ? 40 : 150,
    rotation: 0,
    zIndex: 1,
    locked: false,
    visible: true,
    styles: {},
  };

  const content: CanvasElementContent = {};

  switch (type) {
    case 'text':
      content.text = 'New Text';
      content.fontSize = 16;
      content.fontWeight = '400';
      break;
    case 'shape':
      content.shapeType = 'rectangle';
      content.fill = '#3b82f6';
      content.stroke = '#1e40af';
      content.strokeWidth = 2;
      break;
    case 'image':
      content.src = 'https://via.placeholder.com/200x150';
      content.alt = 'Placeholder image';
      break;
    case 'chart':
      content.chartType = 'bar';
      content.chartData = [];
      break;
    case 'drawing':
      break;
  }

  return { ...baseElement, content };
}

// ============================================================================
// Main Component
// ============================================================================

export default function VisualBuilder() {
  // Canvas state
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled Prototype');

  // Panel state
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('properties');

  // Component library state
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

  // Interactions state (map of element ID to interactions)
  const [interactions, setInteractions] = useState<Map<string, Interaction[]>>(new Map());

  // Canvas settings
  const [canvasWidth] = useState(1200);
  const [canvasHeight] = useState(800);

  // Get selected element
  const selectedElement = useMemo(
    () => elements.find((e) => e.id === selectedId) || null,
    [elements, selectedId]
  );

  // Get interactions for selected element
  const selectedInteractions = useMemo(
    () => (selectedId ? interactions.get(selectedId) || [] : []),
    [interactions, selectedId]
  );

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleElementsChange = useCallback((newElements: CanvasElement[]) => {
    setElements(newElements);
  }, []);

  const handleElementUpdate = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, []);

  const handleElementDelete = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
    // Also remove interactions
    setInteractions((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, [selectedId]);

  const handleContentUpdate = useCallback((updates: Partial<CanvasElementContent>) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId ? { ...el, content: { ...el.content, ...updates } } : el
      )
    );
  }, [selectedId]);

  const handleStyleUpdate = useCallback((key: string, value: string) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedId
          ? { ...el, styles: { ...el.styles, [key]: value } }
          : el
      )
    );
  }, [selectedId]);

  const handleDuplicate = useCallback(() => {
    if (!selectedElement) return;
    const newElement: CanvasElement = {
      ...selectedElement,
      id: generateId(),
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
  }, [selectedElement]);

  const handleDelete = useCallback(() => {
    if (selectedId) {
      handleElementDelete(selectedId);
    }
  }, [selectedId, handleElementDelete]);

  const handleInteractionsChange = useCallback((newInteractions: Interaction[]) => {
    if (!selectedId) return;
    setInteractions((prev) => {
      const next = new Map(prev);
      next.set(selectedId, newInteractions);
      return next;
    });
  }, [selectedId]);

  const handleAddElement = useCallback((type: CanvasElement['type']) => {
    const newElement = createDefaultElement(type, 100, 100);
    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
  }, []);

  const handleImportHTML = useCallback(async () => {
    // Simple file input for importing HTML
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const result = extractComponents(text);
      setExtractionResult(result);
    };
    input.click();
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Toggle Component Library">
            <IconButton onClick={() => setLeftPanelOpen(!leftPanelOpen)}>
              <SidebarIcon size={20} />
            </IconButton>
          </Tooltip>

          <TextField
            size="small"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            variant="standard"
            InputProps={{
              sx: { fontSize: '1rem', fontWeight: 500 },
              disableUnderline: true,
            }}
          />
        </Box>

        {/* Quick Add Tools */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Add Text">
            <IconButton size="small" onClick={() => handleAddElement('text')}>
              <TextT size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Shape">
            <IconButton size="small" onClick={() => handleAddElement('shape')}>
              <Square size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Image">
            <IconButton size="small" onClick={() => handleAddElement('image')}>
              <ImageIcon size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Chart">
            <IconButton size="small" onClick={() => handleAddElement('chart')}>
              <ChartBar size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Drawing">
            <IconButton size="small" onClick={() => handleAddElement('drawing')}>
              <Pencil size={18} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Button
            size="small"
            variant="outlined"
            startIcon={<Upload size={16} />}
            onClick={handleImportHTML}
            sx={{ textTransform: 'none' }}
          >
            Import HTML
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ExportPreview
            elements={elements}
            interactions={interactions}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            projectName={projectName}
          />

          <Tooltip title="Toggle Inspector">
            <IconButton onClick={() => setRightPanelOpen(!rightPanelOpen)}>
              <SlidersHorizontal size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Component Library */}
        {leftPanelOpen && (
          <Box
            sx={{
              width: 280,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Component Library
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <ComponentLibrary
                extractionResult={extractionResult}
                onComponentSelect={(component) => {
                  const newElement: CanvasElement = {
                    id: generateId(),
                    type: 'component',
                    x: 100,
                    y: 100,
                    width: component.bounds.width || 200,
                    height: component.bounds.height || 150,
                    rotation: 0,
                    zIndex: elements.length + 1,
                    locked: false,
                    visible: true,
                    content: {
                      component,
                      html: component.html,
                    },
                    styles: {},
                  };
                  setElements((prev) => [...prev, newElement]);
                  setSelectedId(newElement.id);
                }}
              />
            </Box>
          </Box>
        )}

        {/* Center - Canvas */}
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#1e293b' }}>
          <VisualCanvas
            elements={elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onElementsChange={handleElementsChange}
            onElementUpdate={handleElementUpdate}
            onElementDelete={handleElementDelete}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        </Box>

        {/* Right Panel - Properties & Interactions */}
        {rightPanelOpen && (
          <Box
            sx={{
              width: 320,
              borderLeft: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Tabs
              value={rightPanelTab}
              onChange={(_, v) => setRightPanelTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Tab
                value="properties"
                icon={<SlidersHorizontal size={16} />}
                iconPosition="start"
                label="Properties"
                sx={{ textTransform: 'none', minHeight: 48 }}
              />
              <Tab
                value="interactions"
                icon={<Lightning size={16} />}
                iconPosition="start"
                label="Interactions"
                sx={{ textTransform: 'none', minHeight: 48 }}
              />
            </Tabs>

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {rightPanelTab === 'properties' ? (
                <PropertyInspector
                  element={selectedElement}
                  onUpdate={(updates) => selectedId && handleElementUpdate(selectedId, updates)}
                  onContentUpdate={handleContentUpdate}
                  onStyleUpdate={handleStyleUpdate}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ) : (
                <InteractionEditor
                  element={selectedElement}
                  allElements={elements}
                  interactions={selectedInteractions}
                  onInteractionsChange={handleInteractionsChange}
                />
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
