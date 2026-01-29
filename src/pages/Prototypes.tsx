import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Fade from '@mui/material/Fade';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  ShareNetwork,
  Copy,
  Flask,
} from '@phosphor-icons/react';
import { EmptyState, ThumbnailCard } from '@/components';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useThemeStore } from '@/store/themeStore';
import { useScreensStore } from '@/store/screensStore';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

interface Prototype {
  id: string;
  name: string;
  status: 'draft' | 'shared' | 'deployed' | 'pending' | 'analyzing' | 'planning' | 'plan_ready' | 'generating' | 'complete' | 'failed';
  variants: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  screenId?: string;
  prompt?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'shared':
    case 'plan_ready':
      return 'primary';
    case 'deployed':
    case 'complete':
      return 'success';
    case 'failed':
      return 'error';
    case 'generating':
    case 'analyzing':
    case 'planning':
      return 'warning';
    default:
      return 'default';
  }
};

const getDisplayStatus = (status: string) => {
  switch (status) {
    case 'plan_ready':
      return 'Ready';
    case 'generating':
      return 'Generating';
    case 'analyzing':
      return 'Analyzing';
    case 'planning':
      return 'Planning';
    case 'complete':
      return 'Complete';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
};

export function Prototypes() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const { config, mode } = useThemeStore();
  const { initializeScreens } = useScreensStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPrototypeName, setNewPrototypeName] = useState('');
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Initialize screens and fetch prototypes on mount
  useEffect(() => {
    initializeScreens();
    fetchPrototypes();
  }, []);

  // Fetch prototypes from Supabase
  const fetchPrototypes = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        console.warn('[Prototypes] Supabase not configured');
        setPrototypes([]);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[Prototypes] No authenticated user');
        setPrototypes([]);
        return;
      }

      // Fetch vibe sessions with variant counts
      const { data: sessions, error } = await supabase
        .from('vibe_sessions')
        .select(`
          *,
          vibe_variants(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Prototypes] Error fetching sessions:', error);
        throw error;
      }

      // Map to Prototype format
      const mapped: Prototype[] = (sessions || []).map((session) => ({
        id: session.id,
        name: session.name || 'Untitled Prototype',
        status: session.status || 'draft',
        variants: session.vibe_variants?.[0]?.count || 0,
        views: 0, // TODO: Implement view tracking
        createdAt: session.created_at,
        updatedAt: session.updated_at || session.created_at,
        screenId: session.screen_id,
        prompt: session.prompt,
      }));

      setPrototypes(mapped);
    } catch (error) {
      console.error('[Prototypes] Failed to fetch:', error);
      showError('Failed to load prototypes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, prototype: Prototype) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPrototype(prototype);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreatePrototype = () => {
    if (!newPrototypeName.trim()) return;

    // Navigate to screens page to select a screen for the prototype
    // Or create from a blank screen
    showSuccess('Select a screen to create a prototype');
    setCreateDialogOpen(false);
    setNewPrototypeName('');
    navigate('/repository/screens');
  };

  const handleDeletePrototype = async () => {
    if (!selectedPrototype) return;

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('vibe_sessions')
          .delete()
          .eq('id', selectedPrototype.id);

        if (error) throw error;
      }

      setPrototypes((prev) => prev.filter((p) => p.id !== selectedPrototype.id));
      showSuccess('Prototype deleted');
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete prototype');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPrototype(null);
      setAnchorEl(null);
    }
  };

  const handleDuplicatePrototype = async () => {
    if (!selectedPrototype) return;

    try {
      if (isSupabaseConfigured()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
          .from('vibe_sessions')
          .insert({
            user_id: user.id,
            screen_id: selectedPrototype.screenId,
            name: `${selectedPrototype.name} (Copy)`,
            prompt: selectedPrototype.prompt,
            status: 'draft',
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setPrototypes((prev) => [{
            id: data.id,
            name: data.name,
            status: data.status,
            variants: 0,
            views: 0,
            createdAt: data.created_at,
            updatedAt: data.created_at,
            screenId: data.screen_id,
            prompt: data.prompt,
          }, ...prev]);
        }
      }

      showSuccess('Prototype duplicated');
    } catch (error) {
      console.error('Duplicate error:', error);
      showError('Failed to duplicate prototype');
    } finally {
      handleMenuClose();
    }
  };

  const filteredPrototypes = prototypes.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (tabValue === 0) return matchesSearch;
    if (tabValue === 1) return matchesSearch && (p.status === 'draft' || p.status === 'pending');
    if (tabValue === 2) return matchesSearch && p.status === 'complete';
    if (tabValue === 3) return matchesSearch && (p.status === 'generating' || p.status === 'analyzing' || p.status === 'planning');
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: config.fonts.display,
            fontSize: '2.25rem',
            fontWeight: mode === 'craftsman' ? 400 : 700,
            color: config.colors.textPrimary,
          }}
        >
          Prototypes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
          New Prototype
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          placeholder="Search prototypes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            width: 300,
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
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="All" />
          <Tab label="Drafts" />
          <Tab label="Complete" />
          <Tab label="In Progress" />
        </Tabs>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Grid */}
      {!isLoading && filteredPrototypes.length === 0 ? (
        <EmptyState
          title="No prototypes found"
          description={
            searchQuery
              ? 'Try a different search term'
              : prototypes.length === 0
              ? 'Create your first prototype by selecting a screen from the Repository'
              : 'No prototypes match the current filter'
          }
          action={
            !searchQuery && prototypes.length === 0
              ? { label: 'Go to Screens', onClick: () => navigate('/repository/screens') }
              : undefined
          }
        />
      ) : (
        !isLoading && (
          <Grid container spacing={2}>
            {filteredPrototypes.map((prototype, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={prototype.id}
                sx={{
                  animation: 'fadeInUp 0.4s ease forwards',
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                <ThumbnailCard
                  id={prototype.id}
                  title={prototype.name}
                  subtitle={`Updated ${formatDate(prototype.updatedAt)}`}
                  secondaryInfo={prototype.variants > 0 ? `${prototype.variants} variants` : prototype.prompt?.slice(0, 50)}
                  status={{
                    label: getDisplayStatus(prototype.status),
                    color: getStatusColor(prototype.status),
                  }}
                  onClick={() => navigate(`/prototypes/${prototype.screenId || prototype.id}`)}
                  onMenuClick={(e) => handleMenuOpen(e, prototype)}
                  primaryAction={{
                    icon: <Flask size={24} color="white" weight="fill" />,
                    label: 'Open Prototype',
                    onClick: () => navigate(`/prototypes/${prototype.screenId || prototype.id}`),
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        sx={{
          '& .MuiPaper-root': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate(`/prototypes/${selectedPrototype?.screenId || selectedPrototype?.id}`);
          }}
          sx={{ transition: 'all 0.15s ease' }}
        >
          <ListItemIcon><PencilSimple size={18} color={config.colors.primary} /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleDuplicatePrototype} sx={{ transition: 'all 0.15s ease' }}>
          <ListItemIcon><Copy size={18} color={config.colors.textSecondary} /></ListItemIcon>
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ transition: 'all 0.15s ease' }}>
          <ListItemIcon><ShareNetwork size={18} color={config.colors.textSecondary} /></ListItemIcon>
          Share
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
          }}
          sx={{ color: config.colors.error, transition: 'all 0.15s ease' }}
        >
          <ListItemIcon><Trash size={18} color={config.colors.error} /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: config.fonts.display, fontWeight: mode === 'craftsman' ? 400 : 600 }}>
          Create New Prototype
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            To create a prototype, you'll need to select a captured screen from the Repository.
            The screen will be used as the base for AI-generated variants.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Prototype Name (optional)"
            value={newPrototypeName}
            onChange={(e) => setNewPrototypeName(e.target.value)}
            placeholder="e.g., E-commerce Checkout Flow"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePrototype}
          >
            Select Screen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Fade}
      >
        <DialogTitle>Delete Prototype</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedPrototype?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePrototype} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
