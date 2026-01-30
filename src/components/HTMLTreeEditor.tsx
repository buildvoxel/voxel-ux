/**
 * HTML Tree Editor Component
 * Displays HTML as an interactive, collapsible tree structure
 * Supports editing text nodes with changes persisted back to HTML
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import { CaretRight, CaretDown, Copy, PencilSimple, Check, X, FloppyDisk } from '@phosphor-icons/react';

interface TreeNode {
  type: 'element' | 'text' | 'comment';
  tagName?: string;
  attributes?: Record<string, string>;
  textContent?: string;
  children: TreeNode[];
  id: string;
  depth: number;
}

// Convert tree back to HTML string
function treeToHtml(nodes: TreeNode[]): string {
  function nodeToHtml(node: TreeNode): string {
    if (node.type === 'text') {
      return node.textContent || '';
    }

    if (node.type === 'comment') {
      return `<!-- ${node.textContent || ''} -->`;
    }

    if (node.type === 'element') {
      const tag = node.tagName || 'div';
      const attrs = Object.entries(node.attributes || {})
        .map(([key, value]) => `${key}="${value.replace(/"/g, '&quot;')}"`)
        .join(' ');

      const openTag = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;

      // Self-closing tags
      const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];
      if (selfClosing.includes(tag) && node.children.length === 0) {
        return attrs ? `<${tag} ${attrs} />` : `<${tag} />`;
      }

      const childrenHtml = node.children.map(nodeToHtml).join('');
      return `${openTag}${childrenHtml}</${tag}>`;
    }

    return '';
  }

  return nodes.map(nodeToHtml).join('');
}

// Deep clone tree with updated text node
function updateTreeNode(nodes: TreeNode[], nodeId: string, newText: string): TreeNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return { ...node, textContent: newText };
    }
    if (node.children.length > 0) {
      return { ...node, children: updateTreeNode(node.children, nodeId, newText) };
    }
    return node;
  });
}

interface HTMLTreeEditorProps {
  html: string;
  onHtmlChange?: (html: string) => void;
  readOnly?: boolean;
}

// Parse HTML string into tree structure
function parseHTMLToTree(html: string): TreeNode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  let nodeId = 0;

  function parseNode(node: Node, depth: number): TreeNode | null {
    const id = `node_${nodeId++}`;

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const attributes: Record<string, string> = {};

      for (const attr of Array.from(element.attributes)) {
        attributes[attr.name] = attr.value;
      }

      const children: TreeNode[] = [];
      for (const child of Array.from(node.childNodes)) {
        const parsed = parseNode(child, depth + 1);
        if (parsed) children.push(parsed);
      }

      return {
        type: 'element',
        tagName: element.tagName.toLowerCase(),
        attributes,
        children,
        id,
        depth,
      };
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return null;

      return {
        type: 'text',
        textContent: text,
        children: [],
        id,
        depth,
      };
    } else if (node.nodeType === Node.COMMENT_NODE) {
      return {
        type: 'comment',
        textContent: node.textContent || '',
        children: [],
        id,
        depth,
      };
    }

    return null;
  }

  const nodes: TreeNode[] = [];

  // Parse head if present
  if (doc.head && doc.head.children.length > 0) {
    const headNode = parseNode(doc.head, 0);
    if (headNode) nodes.push(headNode);
  }

  // Parse body
  if (doc.body) {
    const bodyNode = parseNode(doc.body, 0);
    if (bodyNode) nodes.push(bodyNode);
  }

  return nodes;
}

// Tree Node Component
function TreeNodeItem({
  node,
  onTextEdit,
  readOnly,
  defaultExpanded = true,
}: {
  node: TreeNode;
  onTextEdit?: (nodeId: string, newText: string) => void;
  readOnly?: boolean;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded && node.depth < 3);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const hasChildren = node.children.length > 0;
  const indent = node.depth * 16;

  const handleStartEdit = useCallback(() => {
    if (node.type === 'text' && node.textContent) {
      setEditValue(node.textContent);
      setIsEditing(true);
    }
  }, [node]);

  const handleSaveEdit = useCallback(() => {
    if (onTextEdit && editValue !== node.textContent) {
      onTextEdit(node.id, editValue);
    }
    setIsEditing(false);
  }, [onTextEdit, node.id, node.textContent, editValue]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  // Render element node
  if (node.type === 'element') {
    const attrString = Object.entries(node.attributes || {})
      .slice(0, 3) // Limit shown attributes
      .map(([key, value]) => {
        const displayValue = value.length > 30 ? value.slice(0, 30) + '...' : value;
        return (
          <span key={key}>
            <span style={{ color: '#9cdcfe' }}> {key}</span>
            <span style={{ color: '#d4d4d4' }}>=</span>
            <span style={{ color: '#ce9178' }}>"{displayValue}"</span>
          </span>
        );
      });

    const hasMoreAttrs = Object.keys(node.attributes || {}).length > 3;

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            pl: `${indent}px`,
            py: 0.25,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
            cursor: hasChildren ? 'pointer' : 'default',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: 13,
          }}
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          {hasChildren ? (
            <IconButton size="small" sx={{ p: 0.25, mr: 0.5, color: '#858585' }}>
              {isExpanded ? <CaretDown size={12} /> : <CaretRight size={12} />}
            </IconButton>
          ) : (
            <Box sx={{ width: 20 }} />
          )}
          <Typography
            component="span"
            sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: '#808080' }}
          >
            &lt;
          </Typography>
          <Typography
            component="span"
            sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: '#569cd6', fontWeight: 500 }}
          >
            {node.tagName}
          </Typography>
          {attrString}
          {hasMoreAttrs && (
            <Typography
              component="span"
              sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: '#858585', ml: 0.5 }}
            >
              ...
            </Typography>
          )}
          <Typography
            component="span"
            sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: '#808080' }}
          >
            {hasChildren ? '>' : ' />'}
          </Typography>
        </Box>

        {hasChildren && (
          <Collapse in={isExpanded}>
            <Box>
              {node.children.map((child) => (
                <TreeNodeItem
                  key={child.id}
                  node={child}
                  onTextEdit={onTextEdit}
                  readOnly={readOnly}
                />
              ))}
            </Box>
            <Box
              sx={{
                pl: `${indent}px`,
                py: 0.25,
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: 13,
              }}
            >
              <Box sx={{ width: 20, display: 'inline-block' }} />
              <Typography
                component="span"
                sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: '#808080' }}
              >
                &lt;/
              </Typography>
              <Typography
                component="span"
                sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: '#569cd6' }}
              >
                {node.tagName}
              </Typography>
              <Typography
                component="span"
                sx={{ fontFamily: 'inherit', fontSize: 'inherit', color: '#808080' }}
              >
                &gt;
              </Typography>
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }

  // Render text node
  if (node.type === 'text') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: `${indent}px`,
          py: 0.25,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: 13,
        }}
      >
        <Box sx={{ width: 20 }} />
        {isEditing ? (
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0.5 }}>
            <TextField
              size="small"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
              sx={{
                flex: 1,
                '& .MuiInputBase-input': {
                  fontFamily: 'Monaco, Consolas, monospace',
                  fontSize: 13,
                  py: 0.5,
                  color: '#ce9178',
                },
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(0,0,0,0.3)',
                },
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <IconButton size="small" onClick={handleSaveEdit} sx={{ color: '#4fc3f7' }}>
              <Check size={14} />
            </IconButton>
            <IconButton size="small" onClick={handleCancelEdit} sx={{ color: '#f48771' }}>
              <X size={14} />
            </IconButton>
          </Box>
        ) : (
          <>
            <Typography
              component="span"
              sx={{
                fontFamily: 'inherit',
                fontSize: 'inherit',
                color: '#ce9178',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              "{node.textContent}"
            </Typography>
            {!readOnly && (
              <Tooltip title="Edit text">
                <IconButton
                  size="small"
                  onClick={handleStartEdit}
                  sx={{ ml: 1, opacity: 0.5, '&:hover': { opacity: 1 }, color: '#858585' }}
                >
                  <PencilSimple size={12} />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </Box>
    );
  }

  // Render comment node
  if (node.type === 'comment') {
    return (
      <Box
        sx={{
          pl: `${indent}px`,
          py: 0.25,
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: 13,
          color: '#6a9955',
        }}
      >
        <Box sx={{ width: 20, display: 'inline-block' }} />
        &lt;!-- {node.textContent} --&gt;
      </Box>
    );
  }

  return null;
}

export const HTMLTreeEditor: React.FC<HTMLTreeEditorProps> = ({
  html,
  onHtmlChange,
  readOnly = false,
}) => {
  // Parse initial tree from HTML
  const initialTree = useMemo(() => parseHTMLToTree(html), [html]);

  // Track local tree state for edits
  const [tree, setTree] = useState<TreeNode[]>(initialTree);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Keep track of original HTML to detect external changes
  const lastHtmlRef = useRef(html);

  // Update tree when external HTML changes
  useMemo(() => {
    if (html !== lastHtmlRef.current) {
      lastHtmlRef.current = html;
      setTree(parseHTMLToTree(html));
      setHasUnsavedChanges(false);
    }
  }, [html]);

  const handleCopyAll = useCallback(() => {
    const currentHtml = treeToHtml(tree);
    navigator.clipboard.writeText(currentHtml);
  }, [tree]);

  // Handle text node edits
  const handleTextEdit = useCallback((nodeId: string, newText: string) => {
    setTree(prevTree => {
      const updatedTree = updateTreeNode(prevTree, nodeId, newText);
      return updatedTree;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save changes back to parent
  const handleSave = useCallback(() => {
    if (onHtmlChange && hasUnsavedChanges) {
      const newHtml = treeToHtml(tree);
      lastHtmlRef.current = newHtml;
      onHtmlChange(newHtml);
      setHasUnsavedChanges(false);
    }
  }, [tree, onHtmlChange, hasUnsavedChanges]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e1e1e',
        color: '#d4d4d4',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#9cdcfe', fontFamily: 'monospace' }}>
            HTML Tree View
          </Typography>
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
              }}
            >
              unsaved
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
          <Tooltip title="Copy all">
            <IconButton size="small" onClick={handleCopyAll} sx={{ color: 'grey.400' }}>
              <Copy size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tree content */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {tree.length > 0 ? (
          tree.map((node) => (
            <TreeNodeItem
              key={node.id}
              node={node}
              onTextEdit={!readOnly && onHtmlChange ? handleTextEdit : undefined}
              readOnly={readOnly}
              defaultExpanded
            />
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="grey.500">
              No HTML content to display
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HTMLTreeEditor;
