/**
 * Export & Preview Component
 * Provides preview mode and export functionality for visual builder prototypes
 * Supports HTML/CSS export and React component generation
 */

import React, { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {
  Play,
  X,
  Code,
  FileHtml,
  FileJs,
  Copy,
  Download,
  Desktop,
  DeviceMobile,
  DeviceTablet,
  ArrowsOutSimple,
  ArrowsInSimple,
} from '@phosphor-icons/react';

import type { CanvasElement } from './VisualCanvas';
import type { Interaction } from './InteractionEditor';

// ============================================================================
// Types
// ============================================================================

export interface ExportPreviewProps {
  elements: CanvasElement[];
  interactions: Map<string, Interaction[]>;
  canvasWidth: number;
  canvasHeight: number;
  projectName?: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile' | 'full';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============================================================================
// Constants
// ============================================================================

const VIEWPORT_SIZES: Record<ViewportSize, { width: number; height: number; label: string }> = {
  desktop: { width: 1440, height: 900, label: 'Desktop' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  mobile: { width: 375, height: 812, label: 'Mobile' },
  full: { width: 0, height: 0, label: 'Full' },
};

// ============================================================================
// Utility Functions
// ============================================================================

function generateElementHTML(element: CanvasElement): string {
  const styles = `
    position: absolute;
    left: ${element.x}px;
    top: ${element.y}px;
    width: ${element.width}px;
    height: ${element.height}px;
    transform: rotate(${element.rotation}deg);
    ${element.styles ? Object.entries(element.styles).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`).join('\n    ') : ''}
  `.trim();

  switch (element.type) {
    case 'text':
      return `<div style="${styles}" data-element-id="${element.id}">
  <p style="font-size: ${element.content.fontSize || 16}px; font-weight: ${element.content.fontWeight || '400'}; margin: 0;">
    ${element.content.text || 'Text'}
  </p>
</div>`;

    case 'shape':
      if (element.content.shapeType === 'circle') {
        return `<div style="${styles}; border-radius: 50%; background-color: ${element.content.fill || '#3b82f6'}; border: ${element.content.strokeWidth || 1}px solid ${element.content.stroke || '#1e40af'};" data-element-id="${element.id}"></div>`;
      }
      return `<div style="${styles}; background-color: ${element.content.fill || '#3b82f6'}; border: ${element.content.strokeWidth || 1}px solid ${element.content.stroke || '#1e40af'};" data-element-id="${element.id}"></div>`;

    case 'image':
      return `<img src="${element.content.src || ''}" alt="${element.content.alt || ''}" style="${styles}; object-fit: cover;" data-element-id="${element.id}" />`;

    case 'component':
      return `<div style="${styles}" data-element-id="${element.id}" data-component-type="${element.content.component?.type || 'custom'}">
  ${element.content.html || '<!-- Component content -->'}
</div>`;

    default:
      return `<div style="${styles}" data-element-id="${element.id}">
  <!-- ${element.type} element -->
</div>`;
  }
}

function generateInteractionScript(interactions: Map<string, Interaction[]>): string {
  const handlers: string[] = [];

  interactions.forEach((elementInteractions, elementId) => {
    elementInteractions.forEach((interaction) => {
      if (!interaction.enabled) return;

      const selector = `[data-element-id="${elementId}"]`;
      let handler = '';

      switch (interaction.action) {
        case 'navigate':
          handler = interaction.config.openInNewTab
            ? `window.open('${interaction.config.url}', '_blank');`
            : `window.location.href = '${interaction.config.url}';`;
          break;

        case 'showElement':
          handler = `document.querySelector('[data-element-id="${interaction.config.targetElementId}"]').style.display = 'block';`;
          break;

        case 'hideElement':
          handler = `document.querySelector('[data-element-id="${interaction.config.targetElementId}"]').style.display = 'none';`;
          break;

        case 'toggleElement':
          handler = `
            const el = document.querySelector('[data-element-id="${interaction.config.targetElementId}"]');
            el.style.display = el.style.display === 'none' ? 'block' : 'none';
          `;
          break;

        case 'showToast':
          handler = `
            const toast = document.createElement('div');
            toast.className = 'toast toast-${interaction.config.toastType || 'info'}';
            toast.textContent = '${interaction.config.toastMessage || 'Notification'}';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          `;
          break;

        case 'playAnimation':
          handler = `
            const el = document.querySelector('${selector}');
            el.style.animation = '${interaction.config.animationType} ${interaction.config.animationDuration || 300}ms ease';
            setTimeout(() => el.style.animation = '', ${interaction.config.animationDuration || 300});
          `;
          break;

        case 'customCode':
          handler = interaction.config.customCode || '';
          break;
      }

      if (handler) {
        const eventType = interaction.trigger === 'hover' ? 'mouseenter' : interaction.trigger;
        handlers.push(`
  document.querySelector('${selector}')?.addEventListener('${eventType}', function(e) {
    ${handler}
  });`);
      }
    });
  });

  return handlers.length > 0
    ? `<script>
document.addEventListener('DOMContentLoaded', function() {
${handlers.join('\n')}
});
</script>`
    : '';
}

function generateFullHTML(
  elements: CanvasElement[],
  interactions: Map<string, Interaction[]>,
  canvasWidth: number,
  canvasHeight: number,
  projectName: string
): string {
  const visibleElements = elements.filter((e) => e.visible).sort((a, b) => a.zIndex - b.zIndex);

  const elementsHTML = visibleElements.map(generateElementHTML).join('\n\n');
  const interactionsScript = generateInteractionScript(interactions);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
    }

    .canvas {
      position: relative;
      width: ${canvasWidth}px;
      height: ${canvasHeight}px;
      margin: 0 auto;
      background-color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      animation: slideUp 0.3s ease;
      z-index: 9999;
    }

    .toast-success { background-color: #10b981; }
    .toast-error { background-color: #ef4444; }
    .toast-info { background-color: #3b82f6; }
    .toast-warning { background-color: #f59e0b; }

    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(100%); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="canvas">
${elementsHTML.split('\n').map(line => '    ' + line).join('\n')}
  </div>

  ${interactionsScript}
</body>
</html>`;
}

function generateReactComponent(
  elements: CanvasElement[],
  _interactions: Map<string, Interaction[]>,
  projectName: string
): string {
  const componentName = projectName.replace(/[^a-zA-Z0-9]/g, '').replace(/^\d/, '_$&') || 'GeneratedComponent';
  const visibleElements = elements.filter((e) => e.visible).sort((a, b) => a.zIndex - b.zIndex);

  const generateElementJSX = (element: CanvasElement): string => {
    const styleObj = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      ...element.styles,
    };

    const styleString = JSON.stringify(styleObj, null, 2).replace(/"([^"]+)":/g, '$1:');

    switch (element.type) {
      case 'text':
        return `      <div style={${styleString}}>
        <p style={{ fontSize: ${element.content.fontSize || 16}, fontWeight: '${element.content.fontWeight || '400'}', margin: 0 }}>
          ${element.content.text || 'Text'}
        </p>
      </div>`;

      case 'shape':
        const shapeStyle = {
          ...styleObj,
          backgroundColor: element.content.fill || '#3b82f6',
          border: `${element.content.strokeWidth || 1}px solid ${element.content.stroke || '#1e40af'}`,
          borderRadius: element.content.shapeType === 'circle' ? '50%' : undefined,
        };
        return `      <div style={${JSON.stringify(shapeStyle, null, 2).replace(/"([^"]+)":/g, '$1:')}} />`;

      case 'image':
        return `      <img
        src="${element.content.src || ''}"
        alt="${element.content.alt || ''}"
        style={{ ...${styleString}, objectFit: 'cover' }}
      />`;

      default:
        return `      <div style={${styleString}}>
        {/* ${element.type} element */}
      </div>`;
    }
  };

  const elementsJSX = visibleElements.map(generateElementJSX).join('\n\n');

  return `import React from 'react';

/**
 * ${componentName}
 * Generated by Voxel Visual Builder
 */
export default function ${componentName}() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 1200,
      margin: '0 auto',
      backgroundColor: 'white',
      minHeight: 800,
    }}>
${elementsJSX}
    </div>
  );
}
`;
}

function generateJSON(elements: CanvasElement[], interactions: Map<string, Interaction[]>): string {
  return JSON.stringify(
    {
      version: '1.0',
      elements,
      interactions: Object.fromEntries(interactions),
    },
    null,
    2
  );
}

// ============================================================================
// Tab Panel Component
// ============================================================================

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// ============================================================================
// Preview Dialog Component
// ============================================================================

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  html: string;
}

function PreviewDialog({ open, onClose, html }: PreviewDialogProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSize = VIEWPORT_SIZES[viewport];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          width: isFullscreen ? '100%' : '90vw',
          height: isFullscreen ? '100%' : '90vh',
          maxWidth: 'none',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Preview</Typography>
          <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'action.hover', borderRadius: 1, p: 0.5 }}>
            <Tooltip title="Desktop">
              <IconButton
                size="small"
                onClick={() => setViewport('desktop')}
                sx={{ bgcolor: viewport === 'desktop' ? 'background.paper' : 'transparent' }}
              >
                <Desktop size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tablet">
              <IconButton
                size="small"
                onClick={() => setViewport('tablet')}
                sx={{ bgcolor: viewport === 'tablet' ? 'background.paper' : 'transparent' }}
              >
                <DeviceTablet size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Mobile">
              <IconButton
                size="small"
                onClick={() => setViewport('mobile')}
                sx={{ bgcolor: viewport === 'mobile' ? 'background.paper' : 'transparent' }}
              >
                <DeviceMobile size={18} />
              </IconButton>
            </Tooltip>
          </Box>
          {viewport !== 'full' && (
            <Typography variant="caption" color="text.secondary">
              {currentSize.width} x {currentSize.height}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <ArrowsInSimple size={20} /> : <ArrowsOutSimple size={20} />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#1e293b', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          sx={{
            width: viewport === 'full' ? '100%' : currentSize.width,
            height: viewport === 'full' ? '100%' : currentSize.height,
            bgcolor: 'white',
            borderRadius: 1,
            overflow: 'hidden',
            boxShadow: 3,
            transition: 'all 0.3s ease',
          }}
        >
          <iframe
            srcDoc={html}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Preview"
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Export Dialog Component
// ============================================================================

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  interactions: Map<string, Interaction[]>;
  canvasWidth: number;
  canvasHeight: number;
  projectName: string;
}

function ExportDialog({
  open,
  onClose,
  elements,
  interactions,
  canvasWidth,
  canvasHeight,
  projectName,
}: ExportDialogProps) {
  const [tabValue, setTabValue] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  const htmlCode = useMemo(
    () => generateFullHTML(elements, interactions, canvasWidth, canvasHeight, projectName),
    [elements, interactions, canvasWidth, canvasHeight, projectName]
  );

  const reactCode = useMemo(
    () => generateReactComponent(elements, interactions, projectName),
    [elements, interactions, projectName]
  );

  const jsonCode = useMemo(
    () => generateJSON(elements, interactions),
    [elements, interactions]
  );

  const codes = [htmlCode, reactCode, jsonCode];
  const fileNames = [`${projectName}.html`, `${projectName}.tsx`, `${projectName}.json`];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codes[tabValue]);
    setCopySuccess(true);
  }, [codes, tabValue]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([codes[tabValue]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileNames[tabValue];
    a.click();
    URL.revokeObjectURL(url);
  }, [codes, fileNames, tabValue]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Export Code</Typography>
        <IconButton onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab icon={<FileHtml size={18} />} iconPosition="start" label="HTML" />
          <Tab icon={<FileJs size={18} />} iconPosition="start" label="React" />
          <Tab icon={<Code size={18} />} iconPosition="start" label="JSON" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box
            component="pre"
            sx={{
              bgcolor: '#1e293b',
              color: '#e2e8f0',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              maxHeight: 'calc(80vh - 200px)',
            }}
          >
            <code>{htmlCode}</code>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            component="pre"
            sx={{
              bgcolor: '#1e293b',
              color: '#e2e8f0',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              maxHeight: 'calc(80vh - 200px)',
            }}
          >
            <code>{reactCode}</code>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box
            component="pre"
            sx={{
              bgcolor: '#1e293b',
              color: '#e2e8f0',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              maxHeight: 'calc(80vh - 200px)',
            }}
          >
            <code>{jsonCode}</code>
          </Box>
        </TabPanel>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button startIcon={<Copy size={16} />} onClick={handleCopy} variant="outlined">
          Copy
        </Button>
        <Button startIcon={<Download size={16} />} onClick={handleDownload} variant="contained">
          Download
        </Button>
      </DialogActions>

      <Snackbar open={copySuccess} autoHideDuration={2000} onClose={() => setCopySuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

// ============================================================================
// Main Export Preview Component
// ============================================================================

export default function ExportPreview({
  elements,
  interactions,
  canvasWidth,
  canvasHeight,
  projectName = 'Prototype',
}: ExportPreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const previewHTML = useMemo(
    () => generateFullHTML(elements, interactions, canvasWidth, canvasHeight, projectName),
    [elements, interactions, canvasWidth, canvasHeight, projectName]
  );

  return (
    <>
      {/* Toolbar Buttons */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Preview">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Play size={16} />}
            onClick={() => setPreviewOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Preview
          </Button>
        </Tooltip>
        <Tooltip title="Export">
          <Button
            variant="contained"
            size="small"
            startIcon={<Code size={16} />}
            onClick={() => setExportOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Export
          </Button>
        </Tooltip>
      </Box>

      {/* Preview Dialog */}
      <PreviewDialog open={previewOpen} onClose={() => setPreviewOpen(false)} html={previewHTML} />

      {/* Export Dialog */}
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        elements={elements}
        interactions={interactions}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        projectName={projectName}
      />
    </>
  );
}
