/**
 * Component Library Panel
 * Displays extracted components with thumbnails and search/filter functionality
 * Supports drag-and-drop to canvas via @dnd-kit
 */

import React, { useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  MagnifyingGlass,
  CaretDown,
  CaretRight,
  SquaresFour,
  Rows,
  Cube,
  TextT,
  Image as ImageIcon,
  Table,
  ListBullets,
  Cards,
  NavigationArrow,
  PushPin,
} from '@phosphor-icons/react';

import type {
  ExtractedComponent,
  ComponentType,
  ExtractionResult
} from '@/services/visualBuilder/componentExtractor';

// ============================================================================
// Types
// ============================================================================

export interface ComponentLibraryProps {
  extractionResult: ExtractionResult | null;
  onComponentSelect?: (component: ExtractedComponent) => void;
  viewMode?: 'grid' | 'list';
}

interface DraggableComponentItemProps {
  component: ExtractedComponent;
  viewMode: 'grid' | 'list';
  onSelect?: (component: ExtractedComponent) => void;
}

// ============================================================================
// Component Type Icons & Colors
// ============================================================================

const TYPE_ICONS: Record<ComponentType, React.ReactNode> = {
  button: <Cube size={16} />,
  input: <TextT size={16} />,
  card: <Cards size={16} />,
  navbar: <NavigationArrow size={16} />,
  sidebar: <PushPin size={16} />,
  footer: <Rows size={16} />,
  hero: <SquaresFour size={16} />,
  form: <ListBullets size={16} />,
  table: <Table size={16} />,
  list: <ListBullets size={16} />,
  modal: <SquaresFour size={16} />,
  dropdown: <CaretDown size={16} />,
  tabs: <Rows size={16} />,
  accordion: <Rows size={16} />,
  image: <ImageIcon size={16} />,
  icon: <Cube size={16} />,
  badge: <Cube size={16} />,
  avatar: <Cube size={16} />,
  alert: <Cube size={16} />,
  breadcrumb: <NavigationArrow size={16} />,
  pagination: <Rows size={16} />,
  progress: <Rows size={16} />,
  tooltip: <Cube size={16} />,
  menu: <ListBullets size={16} />,
  section: <SquaresFour size={16} />,
  container: <SquaresFour size={16} />,
  grid: <SquaresFour size={16} />,
  custom: <Cube size={16} />,
};

// Larger icons for grid view
const TYPE_ICONS_LARGE: Record<ComponentType, React.ReactNode> = {
  button: <Cube size={24} />,
  input: <TextT size={24} />,
  card: <Cards size={24} />,
  navbar: <NavigationArrow size={24} />,
  sidebar: <PushPin size={24} />,
  footer: <Rows size={24} />,
  hero: <SquaresFour size={24} />,
  form: <ListBullets size={24} />,
  table: <Table size={24} />,
  list: <ListBullets size={24} />,
  modal: <SquaresFour size={24} />,
  dropdown: <CaretDown size={24} />,
  tabs: <Rows size={24} />,
  accordion: <Rows size={24} />,
  image: <ImageIcon size={24} />,
  icon: <Cube size={24} />,
  badge: <Cube size={24} />,
  avatar: <Cube size={24} />,
  alert: <Cube size={24} />,
  breadcrumb: <NavigationArrow size={24} />,
  pagination: <Rows size={24} />,
  progress: <Rows size={24} />,
  tooltip: <Cube size={24} />,
  menu: <ListBullets size={24} />,
  section: <SquaresFour size={24} />,
  container: <SquaresFour size={24} />,
  grid: <SquaresFour size={24} />,
  custom: <Cube size={24} />,
};

const TYPE_COLORS: Record<ComponentType, string> = {
  button: '#3b82f6',
  input: '#8b5cf6',
  card: '#ec4899',
  navbar: '#06b6d4',
  sidebar: '#14b8a6',
  footer: '#64748b',
  hero: '#f59e0b',
  form: '#8b5cf6',
  table: '#10b981',
  list: '#6366f1',
  modal: '#ef4444',
  dropdown: '#8b5cf6',
  tabs: '#f97316',
  accordion: '#f97316',
  image: '#06b6d4',
  icon: '#64748b',
  badge: '#ec4899',
  avatar: '#06b6d4',
  alert: '#ef4444',
  breadcrumb: '#64748b',
  pagination: '#6366f1',
  progress: '#10b981',
  tooltip: '#64748b',
  menu: '#6366f1',
  section: '#f59e0b',
  container: '#64748b',
  grid: '#64748b',
  custom: '#94a3b8',
};

// ============================================================================
// Draggable Component Item
// ============================================================================

function DraggableComponentItem({ component, viewMode, onSelect }: DraggableComponentItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: component.id,
    data: {
      type: 'component',
      component,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const typeColor = TYPE_COLORS[component.type] || '#94a3b8';
  const typeIcon = TYPE_ICONS[component.type] || <Cube size={16} />;
  const typeIconLarge = TYPE_ICONS_LARGE[component.type] || <Cube size={24} />;

  if (viewMode === 'list') {
    return (
      <Box
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => onSelect?.(component)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'grab',
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: typeColor,
            boxShadow: `0 0 0 1px ${typeColor}20`,
            transform: 'translateX(2px)',
          },
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: `${typeColor}15`,
            color: typeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {typeIcon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={500}
            noWrap
            sx={{ lineHeight: 1.2 }}
          >
            {component.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {component.type}
          </Typography>
        </Box>
        {component.metadata.isInteractive && (
          <Tooltip title="Interactive">
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#10b981',
                flexShrink: 0,
              }}
            />
          </Tooltip>
        )}
      </Box>
    );
  }

  // Grid view
  return (
    <Tooltip title={component.name} placement="top">
      <Box
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => onSelect?.(component)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          p: 1,
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'grab',
          transition: 'all 0.15s ease',
          '&:hover': {
            borderColor: typeColor,
            boxShadow: `0 2px 8px ${typeColor}20`,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        {/* Component Preview Thumbnail */}
        <Box
          sx={{
            width: '100%',
            height: 48,
            borderRadius: 0.5,
            bgcolor: `${typeColor}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: typeColor,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {typeIconLarge}
          {component.metadata.isInteractive && (
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#10b981',
              }}
            />
          )}
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ width: '100%', textAlign: 'center' }}
        >
          {component.type}
        </Typography>
      </Box>
    </Tooltip>
  );
}

// ============================================================================
// Component Library Panel
// ============================================================================

export default function ComponentLibrary({
  extractionResult,
  onComponentSelect,
  viewMode: initialViewMode = 'grid',
}: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [selectedTypes, setSelectedTypes] = useState<ComponentType[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set([0, 1, 2, 3]) // Expand first few categories by default
  );

  // Filter components based on search and type filters
  const filteredComponents = useMemo(() => {
    if (!extractionResult) return [];

    let components = extractionResult.components;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      components = components.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.type.toLowerCase().includes(query)
      );
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      components = components.filter(c => selectedTypes.includes(c.type));
    }

    return components;
  }, [extractionResult, searchQuery, selectedTypes]);

  // Group components by category
  const groupedComponents = useMemo(() => {
    const groups: { title: string; types: ComponentType[]; components: ExtractedComponent[] }[] = [
      { title: 'Navigation', types: ['navbar', 'sidebar', 'footer', 'menu', 'breadcrumb'], components: [] },
      { title: 'Layout', types: ['hero', 'section', 'container', 'grid'], components: [] },
      { title: 'Containers', types: ['card', 'modal', 'accordion', 'tabs'], components: [] },
      { title: 'Form', types: ['form', 'input', 'button', 'dropdown'], components: [] },
      { title: 'Data', types: ['table', 'list', 'pagination'], components: [] },
      { title: 'Media', types: ['image', 'icon', 'avatar', 'badge'], components: [] },
      { title: 'Feedback', types: ['alert', 'progress', 'tooltip'], components: [] },
      { title: 'Other', types: ['custom'], components: [] },
    ];

    filteredComponents.forEach(component => {
      const groupIndex = groups.findIndex(g => g.types.includes(component.type));
      if (groupIndex >= 0) {
        groups[groupIndex].components.push(component);
      } else {
        groups[groups.length - 1].components.push(component);
      }
    });

    return groups.filter(g => g.components.length > 0);
  }, [filteredComponents]);

  const handleTypeToggle = useCallback((type: ComponentType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleCategoryToggle = useCallback((index: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Get unique types in the extraction result
  const availableTypes = useMemo(() => {
    if (!extractionResult) return [];
    const types = new Set<ComponentType>();
    extractionResult.components.forEach(c => types.add(c.type));
    return Array.from(types);
  }, [extractionResult]);

  if (!extractionResult || extractionResult.components.length === 0) {
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
          No components extracted yet.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Extract components from a prototype to see them here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Components ({filteredComponents.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{
                bgcolor: viewMode === 'grid' ? 'action.selected' : 'transparent',
              }}
            >
              <SquaresFour size={16} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              sx={{
                bgcolor: viewMode === 'list' ? 'action.selected' : 'transparent',
              }}
            >
              <Rows size={16} />
            </IconButton>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search components..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <MagnifyingGlass size={16} style={{ marginRight: 8, color: '#94a3b8' }} />,
          }}
          sx={{ mb: 1 }}
        />

        {/* Type Filters */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {availableTypes.slice(0, 8).map(type => (
            <Chip
              key={type}
              label={type}
              size="small"
              onClick={() => handleTypeToggle(type)}
              sx={{
                bgcolor: selectedTypes.includes(type)
                  ? `${TYPE_COLORS[type]}20`
                  : 'transparent',
                borderColor: TYPE_COLORS[type],
                color: selectedTypes.includes(type) ? TYPE_COLORS[type] : 'text.secondary',
                '&:hover': {
                  bgcolor: `${TYPE_COLORS[type]}10`,
                },
              }}
              variant={selectedTypes.includes(type) ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {/* Component List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {groupedComponents.map((group, groupIndex) => (
          <Box key={group.title} sx={{ mb: 1 }}>
            {/* Category Header */}
            <Box
              onClick={() => handleCategoryToggle(groupIndex)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                py: 0.5,
                px: 1,
                cursor: 'pointer',
                borderRadius: 0.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {expandedCategories.has(groupIndex) ? (
                <CaretDown size={14} />
              ) : (
                <CaretRight size={14} />
              )}
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {group.title}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                ({group.components.length})
              </Typography>
            </Box>

            {/* Category Content */}
            <Collapse in={expandedCategories.has(groupIndex)}>
              <Box
                sx={{
                  display: viewMode === 'grid' ? 'grid' : 'flex',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(3, 1fr)' : undefined,
                  flexDirection: viewMode === 'list' ? 'column' : undefined,
                  gap: 0.5,
                  p: 0.5,
                }}
              >
                {group.components.map(component => (
                  <DraggableComponentItem
                    key={component.id}
                    component={component}
                    viewMode={viewMode}
                    onSelect={onComponentSelect}
                  />
                ))}
              </Box>
            </Collapse>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
