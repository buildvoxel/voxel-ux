import { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import { MagnifyingGlass, GridFour, List, ArrowsClockwise, X } from '@phosphor-icons/react';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@/components/ui';
import { EmptyState, PageHeader } from '@/components';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useComponentsStore, getCategories, getAllTags, type ExtractedComponent } from '@/store/componentsStore';
import { useScreensStore } from '@/store/screensStore';
import { useThemeStore } from '@/store/themeStore';

// Component preview renderer
function ComponentPreview({ component }: { component: ExtractedComponent }) {
  const combinedCode = `
    <style>${component.css}</style>
    <div style="padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100%;">
      ${component.html}
    </div>
  `;

  return (
    <iframe
      srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}</style></head><body>${combinedCode}</body></html>`}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: 'white',
      }}
      title={component.name}
      sandbox="allow-same-origin"
    />
  );
}

// Code block with copy
function CodeBlock({ code, language }: { code: string; language: string }) {
  const { showSuccess } = useSnackbar();

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    showSuccess(`${language.toUpperCase()} copied to clipboard`);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        startIcon={<ContentCopyOutlinedIcon />}
        size="small"
        onClick={copyCode}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        Copy
      </Button>
      <Box
        component="pre"
        sx={{
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          p: 2,
          borderRadius: 2,
          overflow: 'auto',
          maxHeight: 400,
          fontSize: 13,
          lineHeight: 1.5,
          m: 0,
        }}
      >
        <code>{code}</code>
      </Box>
    </Box>
  );
}

// Component card
function ComponentCard({
  component,
  onClick,
}: {
  component: ExtractedComponent;
  onClick: () => void;
}) {
  const { showSuccess } = useSnackbar();

  const copyHTML = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(component.html);
    showSuccess('HTML copied');
  };

  const copyCSS = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(component.css);
    showSuccess('CSS copied');
  };

  const copyBoth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const combined = `/* CSS */\n${component.css}\n\n<!-- HTML -->\n${component.html}`;
    navigator.clipboard.writeText(combined);
    showSuccess('HTML + CSS copied');
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          height: 160,
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <ComponentPreview component={component} />
      </Box>
      <CardContent sx={{ py: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {component.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
          {component.category}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {component.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 1.5, pt: 0 }}>
        <Tooltip title="Copy HTML">
          <Button size="small" startIcon={<CodeOutlinedIcon />} onClick={copyHTML}>
            HTML
          </Button>
        </Tooltip>
        <Tooltip title="Copy CSS">
          <Button size="small" startIcon={<CodeOutlinedIcon />} onClick={copyCSS}>
            CSS
          </Button>
        </Tooltip>
        <Tooltip title="Copy Both">
          <Button size="small" startIcon={<ContentCopyOutlinedIcon />} onClick={copyBoth}>
            All
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

// Detail modal
function ComponentDetailModal({
  component,
  open,
  onClose,
}: {
  component: ExtractedComponent | null;
  open: boolean;
  onClose: () => void;
}) {
  const { showSuccess } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);

  if (!component) return null;

  const copyAll = () => {
    const combined = `/* CSS */\n${component.css}\n\n<!-- HTML -->\n${component.html}`;
    navigator.clipboard.writeText(combined);
    showSuccess('Component code copied to clipboard');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">{component.name}</Typography>
          <Chip label={component.category} size="small" sx={{ textTransform: 'capitalize' }} />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {component.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" color="primary" sx={{ mr: 0.5, mb: 0.5 }} />
          ))}
        </Box>

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab icon={<VisibilityOutlinedIcon />} label="Preview" iconPosition="start" />
          <Tab icon={<CodeOutlinedIcon />} label="HTML" iconPosition="start" />
          <Tab icon={<CodeOutlinedIcon />} label="CSS" iconPosition="start" />
        </Tabs>

        {tabValue === 0 && (
          <Box
            sx={{
              height: 300,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'grey.100',
            }}
          >
            <ComponentPreview component={component} />
          </Box>
        )}
        {tabValue === 1 && <CodeBlock code={component.html} language="html" />}
        {tabValue === 2 && <CodeBlock code={component.css} language="css" />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<ContentCopyOutlinedIcon />} onClick={copyAll}>
          Copy All Code
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function Components() {
  const {
    components,
    searchQuery,
    selectedCategory,
    selectedTags,
    setSearchQuery,
    setSelectedCategory,
    toggleTag,
    clearFilters,
    selectedComponent,
    selectComponent,
    extractFromScreens,
    isExtracting,
    lastExtractionTime,
  } = useComponentsStore();

  const { screens, initializeScreens } = useScreensStore();
  const { showSuccess } = useSnackbar();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize screens if not loaded
  useEffect(() => {
    if (screens.length === 0) {
      initializeScreens();
    }
  }, []);

  // Auto-extract components when screens are available and no components exist
  useEffect(() => {
    if (screens.length > 0 && components.length === 0 && !isExtracting) {
      extractFromScreens(screens);
    }
  }, [screens.length]);

  // Manual refresh
  const handleRefresh = async () => {
    await extractFromScreens(screens);
    showSuccess(`Extracted components from ${screens.filter(s => s.editedHtml).length} screens`);
  };

  const categories = useMemo(() => getCategories(components), [components]);
  const allTags = useMemo(() => getAllTags(components), [components]);

  const filteredComponents = useMemo(() => {
    return components.filter((comp) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = comp.name.toLowerCase().includes(query);
        const matchesTags = comp.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        const matchesCategory = comp.category.toLowerCase().includes(query);
        if (!matchesName && !matchesTags && !matchesCategory) {
          return false;
        }
      }

      if (selectedCategory && comp.category !== selectedCategory) {
        return false;
      }

      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((tag) => comp.tags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }

      return true;
    });
  }, [components, searchQuery, selectedCategory, selectedTags]);

  const hasFilters = searchQuery || selectedCategory || selectedTags.length > 0;
  const { config } = useThemeStore();

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Component Library"
        subtitle={`${filteredComponents.length} of ${components.length} components${lastExtractionTime ? ` · Last extracted: ${new Date(lastExtractionTime).toLocaleString()}` : ''}`}
        actions={
          <>
            <TextField
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{
                width: 220,
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlass size={18} color={config.colors.textSecondary} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={selectedCategory || ''}
                displayEmpty
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat} sx={{ textTransform: 'capitalize' }}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <ToggleButton value="grid">
                <GridFour size={18} />
              </ToggleButton>
              <ToggleButton value="list">
                <List size={18} />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              size="small"
              startIcon={isExtracting ? <CircularProgress size={16} color="inherit" /> : <ArrowsClockwise size={18} />}
              onClick={handleRefresh}
              disabled={isExtracting || screens.length === 0}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              {isExtracting ? 'Extracting...' : 'Extract Components'}
            </Button>
          </>
        }
      />

      {/* Tag filters */}
      {allTags.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {allTags.slice(0, 10).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              color={selectedTags.includes(tag) ? 'primary' : 'default'}
              variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
              onClick={() => toggleTag(tag)}
              sx={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            />
          ))}
          {hasFilters && (
            <Button
              size="small"
              startIcon={<X size={14} />}
              onClick={clearFilters}
              sx={{ ml: 1 }}
            >
              Clear filters
            </Button>
          )}
        </Box>
      )}

      {/* Components Grid */}
      {filteredComponents.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No components match your filters' : 'No components extracted yet'}
          description={hasFilters ? 'Try adjusting your filters' : 'Components will appear here when extracted from screens'}
          action={hasFilters ? { label: 'Clear Filters', onClick: clearFilters } : undefined}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredComponents.map((component) => (
            <Grid
              item
              key={component.id}
              xs={12}
              sm={6}
              md={viewMode === 'grid' ? 4 : 6}
              lg={viewMode === 'grid' ? 3 : 4}
            >
              <ComponentCard
                component={component}
                onClick={() => selectComponent(component)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail Modal */}
      <ComponentDetailModal
        component={selectedComponent}
        open={!!selectedComponent}
        onClose={() => selectComponent(null)}
      />
    </Box>
  );
}
