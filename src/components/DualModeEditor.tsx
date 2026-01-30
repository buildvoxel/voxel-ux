/**
 * Dual Mode Editor Component
 * Combines HTML Tree View and Monaco Code Editor with tab switching
 */

import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import { TreeStructure, Code, Copy, FloppyDisk, ArrowCounterClockwise } from '@phosphor-icons/react';
import Editor from '@monaco-editor/react';
import HTMLTreeEditor from './HTMLTreeEditor';

interface DualModeEditorProps {
  html: string;
  onHtmlChange?: (html: string) => void;
  readOnly?: boolean;
  height?: string | number;
}

type EditorMode = 'tree' | 'code';

// Format HTML with proper indentation
function formatHtml(html: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Simple HTML formatter
  const tokens = html.replace(/>\s*</g, '>\n<').split('\n');

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    // Decrease indent for closing tags
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }

    formatted += tab.repeat(indent) + trimmed + '\n';

    // Increase indent for opening tags (not self-closing)
    if (
      trimmed.startsWith('<') &&
      !trimmed.startsWith('</') &&
      !trimmed.endsWith('/>') &&
      !trimmed.includes('</') &&
      !['<br>', '<hr>', '<img', '<input', '<meta', '<link'].some(t => trimmed.toLowerCase().startsWith(t))
    ) {
      indent++;
    }
  }

  return formatted.trim();
}

export const DualModeEditor: React.FC<DualModeEditorProps> = ({
  html,
  onHtmlChange,
  readOnly = false,
  height = '100%',
}) => {
  const [mode, setMode] = useState<EditorMode>('tree');
  const [localHtml, setLocalHtml] = useState(html);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);

  // Sync local state when external html changes
  useEffect(() => {
    setLocalHtml(html);
    setHasUnsavedChanges(false);
  }, [html]);

  const handleModeChange = useCallback((_: React.MouseEvent, newMode: EditorMode | null) => {
    if (newMode) {
      setMode(newMode);
    }
  }, []);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setLocalHtml(value);
      setHasUnsavedChanges(value !== html);
    }
  }, [html]);

  const handleTreeChange = useCallback((newHtml: string) => {
    setLocalHtml(newHtml);
    setHasUnsavedChanges(newHtml !== html);
  }, [html]);

  const handleSave = useCallback(() => {
    if (onHtmlChange && hasUnsavedChanges) {
      onHtmlChange(localHtml);
      setHasUnsavedChanges(false);
    }
  }, [localHtml, onHtmlChange, hasUnsavedChanges]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(localHtml);
  }, [localHtml]);

  const handleFormat = useCallback(() => {
    setIsFormatting(true);
    setTimeout(() => {
      const formatted = formatHtml(localHtml);
      setLocalHtml(formatted);
      setHasUnsavedChanges(formatted !== html);
      setIsFormatting(false);
    }, 100);
  }, [localHtml, html]);

  const handleRevert = useCallback(() => {
    setLocalHtml(html);
    setHasUnsavedChanges(false);
  }, [html]);

  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e1e1e',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Header with mode toggle and actions */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Mode toggle */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: 'grey.500',
              borderColor: 'rgba(255,255,255,0.1)',
              px: 1.5,
              py: 0.5,
              '&.Mui-selected': {
                color: '#4fc3f7',
                bgcolor: 'rgba(79, 195, 247, 0.1)',
              },
            },
          }}
        >
          <ToggleButton value="tree">
            <TreeStructure size={16} style={{ marginRight: 4 }} />
            <Typography variant="caption">Tree</Typography>
          </ToggleButton>
          <ToggleButton value="code">
            <Code size={16} style={{ marginRight: 4 }} />
            <Typography variant="caption">Code</Typography>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Status and actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {hasUnsavedChanges && (
            <Typography
              variant="caption"
              sx={{
                color: '#f0ad4e',
                fontFamily: 'monospace',
                fontSize: 10,
                bgcolor: 'rgba(240, 173, 78, 0.15)',
                px: 0.75,
                py: 0.25,
                borderRadius: 0.5,
                mr: 1,
              }}
            >
              unsaved
            </Typography>
          )}

          {mode === 'code' && (
            <Tooltip title="Format HTML">
              <IconButton
                size="small"
                onClick={handleFormat}
                disabled={isFormatting}
                sx={{ color: 'grey.500', '&:hover': { color: '#81d4fa' } }}
              >
                {isFormatting ? <CircularProgress size={14} /> : <Code size={16} />}
              </IconButton>
            </Tooltip>
          )}

          {hasUnsavedChanges && (
            <Tooltip title="Revert changes">
              <IconButton
                size="small"
                onClick={handleRevert}
                sx={{ color: 'grey.500', '&:hover': { color: '#f48771' } }}
              >
                <ArrowCounterClockwise size={16} />
              </IconButton>
            </Tooltip>
          )}

          {onHtmlChange && hasUnsavedChanges && (
            <Tooltip title="Save changes">
              <IconButton
                size="small"
                onClick={handleSave}
                sx={{ color: '#4fc3f7', '&:hover': { color: '#81d4fa' } }}
              >
                <FloppyDisk size={16} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Copy HTML">
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{ color: 'grey.500', '&:hover': { color: 'grey.300' } }}
            >
              <Copy size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Editor content */}
      <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {mode === 'tree' ? (
          <HTMLTreeEditor
            html={localHtml}
            onHtmlChange={!readOnly ? handleTreeChange : undefined}
            readOnly={readOnly}
          />
        ) : (
          <Editor
            height="100%"
            language="html"
            theme="vs-dark"
            value={localHtml}
            onChange={!readOnly ? handleCodeChange : undefined}
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'Monaco, Consolas, monospace',
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              folding: true,
              foldingStrategy: 'indentation',
              formatOnPaste: true,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default DualModeEditor;
