/**
 * WYSIWYG Editor Component
 * Interactive HTML editor with text editing, image replacement, and color picking
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import {
  Image as ImageIcon,
  Palette,
  Check,
  X,
  TextT,
  Trash,
} from '@phosphor-icons/react';

interface WYSIWYGEditorProps {
  html: string;
  onHtmlChange: (html: string) => void;
  readOnly?: boolean;
}

interface SelectedElement {
  element: Element;
  type: 'text' | 'image' | 'background';
  rect: DOMRect;
  originalValue: string;
}

// Common colors for quick selection
const PRESET_COLORS = [
  '#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
];

export const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  html,
  onHtmlChange,
  readOnly = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [editValue, setEditValue] = useState('');
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
  const [editMode, setEditMode] = useState<'text' | 'color' | 'image' | null>(null);
  const [customColor, setCustomColor] = useState('#000000');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inject click handlers into iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || readOnly) return;

    const handleLoad = () => {
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) return;

      // Add hover styles
      const style = iframeDoc.createElement('style');
      style.textContent = `
        * {
          cursor: pointer !important;
        }
        *:hover {
          outline: 2px dashed rgba(118, 75, 162, 0.5) !important;
          outline-offset: 2px !important;
        }
        .wysiwyg-selected {
          outline: 2px solid #764ba2 !important;
          outline-offset: 2px !important;
        }
      `;
      iframeDoc.head.appendChild(style);

      // Add click handler
      iframeDoc.body.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as Element;
        if (!target) return;

        // Remove previous selection
        iframeDoc.querySelectorAll('.wysiwyg-selected').forEach((el) => {
          el.classList.remove('wysiwyg-selected');
        });

        // Add selection to clicked element
        target.classList.add('wysiwyg-selected');

        // Determine element type and value
        const tagName = target.tagName.toLowerCase();
        let type: SelectedElement['type'] = 'text';
        let originalValue = '';

        if (tagName === 'img') {
          type = 'image';
          originalValue = (target as HTMLImageElement).src;
        } else if (target.textContent && target.children.length === 0) {
          type = 'text';
          originalValue = target.textContent;
        } else {
          // Check for background
          const style = window.getComputedStyle(target);
          if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            type = 'background';
            originalValue = style.backgroundColor;
          } else {
            type = 'text';
            originalValue = target.textContent || '';
          }
        }

        const iframeRect = iframe.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        setSelectedElement({
          element: target,
          type,
          rect: targetRect,
          originalValue,
        });

        setEditValue(originalValue);
        setAnchorPosition({
          top: iframeRect.top + targetRect.bottom + 8,
          left: iframeRect.left + targetRect.left,
        });
        setEditMode(null);
      });
    };

    iframe.addEventListener('load', handleLoad);
    // Trigger for initial content
    if (iframe.contentDocument?.body) {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [html, readOnly]);

  // Handle text edit
  const handleTextEdit = useCallback(() => {
    if (!selectedElement || !iframeRef.current?.contentDocument) return;

    selectedElement.element.textContent = editValue;

    // Get updated HTML
    const updatedHtml = iframeRef.current.contentDocument.documentElement.outerHTML;
    onHtmlChange(updatedHtml);

    handleClose();
  }, [selectedElement, editValue, onHtmlChange]);

  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    if (!selectedElement || !iframeRef.current?.contentDocument) return;

    const element = selectedElement.element as HTMLElement;
    if (selectedElement.type === 'background') {
      element.style.backgroundColor = color;
    } else {
      element.style.color = color;
    }

    // Get updated HTML
    const updatedHtml = iframeRef.current.contentDocument.documentElement.outerHTML;
    onHtmlChange(updatedHtml);

    handleClose();
  }, [selectedElement, onHtmlChange]);

  // Handle image replacement
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement || !iframeRef.current?.contentDocument) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      (selectedElement.element as HTMLImageElement).src = dataUrl;

      // Get updated HTML
      const updatedHtml = iframeRef.current!.contentDocument!.documentElement.outerHTML;
      onHtmlChange(updatedHtml);

      handleClose();
    };
    reader.readAsDataURL(file);
  }, [selectedElement, onHtmlChange]);

  // Handle delete element
  const handleDelete = useCallback(() => {
    if (!selectedElement || !iframeRef.current?.contentDocument) return;

    selectedElement.element.remove();

    // Get updated HTML
    const updatedHtml = iframeRef.current.contentDocument.documentElement.outerHTML;
    onHtmlChange(updatedHtml);

    handleClose();
  }, [selectedElement, onHtmlChange]);

  // Close popover
  const handleClose = useCallback(() => {
    setSelectedElement(null);
    setAnchorPosition(null);
    setEditMode(null);
    setEditValue('');

    // Remove selection highlight
    const iframeDoc = iframeRef.current?.contentDocument;
    if (iframeDoc) {
      iframeDoc.querySelectorAll('.wysiwyg-selected').forEach((el) => {
        el.classList.remove('wysiwyg-selected');
      });
    }
  }, []);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Preview iframe */}
      <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          title="WYSIWYG Preview"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />

        {/* Edit popover */}
        <Popover
          open={Boolean(anchorPosition) && Boolean(selectedElement)}
          anchorReference="anchorPosition"
          anchorPosition={anchorPosition || { top: 0, left: 0 }}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          slotProps={{
            paper: {
              sx: { minWidth: 280, maxWidth: 400 },
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            {/* Mode selector */}
            {!editMode && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {selectedElement?.type !== 'image' && (
                  <>
                    <Tooltip title="Edit Text">
                      <IconButton onClick={() => setEditMode('text')} color="primary">
                        <TextT size={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Change Color">
                      <IconButton onClick={() => setEditMode('color')} color="primary">
                        <Palette size={20} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {selectedElement?.type === 'image' && (
                  <Tooltip title="Replace Image">
                    <IconButton onClick={() => fileInputRef.current?.click()} color="primary">
                      <ImageIcon size={20} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete Element">
                  <IconButton onClick={handleDelete} color="error">
                    <Trash size={20} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Text edit mode */}
            {editMode === 'text' && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Edit Text Content
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={4}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  size="small"
                  autoFocus
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => setEditMode(null)} startIcon={<X size={14} />}>
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleTextEdit}
                    startIcon={<Check size={14} />}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
            )}

            {/* Color edit mode */}
            {editMode === 'color' && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                  {selectedElement?.type === 'background' ? 'Background Color' : 'Text Color'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                  {PRESET_COLORS.map((color) => (
                    <Box
                      key={color}
                      onClick={() => handleColorChange(color)}
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: color,
                        borderRadius: 0.5,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: color === '#ffffff' ? 'grey.300' : 'transparent',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 2,
                        },
                        transition: 'all 0.15s ease',
                      }}
                    />
                  ))}
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Custom:
                  </Typography>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{ width: 32, height: 32, cursor: 'pointer', border: 'none' }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleColorChange(customColor)}
                  >
                    Apply
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => setEditMode(null)} startIcon={<X size={14} />}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Popover>

        {/* Hidden file input for image replacement */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageChange}
        />
      </Box>
    </Box>
  );
};

export default WYSIWYGEditor;
