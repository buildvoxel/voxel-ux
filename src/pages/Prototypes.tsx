import { useState } from 'react';
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

interface Prototype {
  id: string;
  name: string;
  status: 'draft' | 'shared' | 'deployed';
  variants: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockPrototypes: Prototype[] = [
  {
    id: '1',
    name: 'E-commerce Checkout Flow',
    status: 'shared',
    variants: 4,
    views: 234,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    name: 'Dashboard Redesign',
    status: 'draft',
    variants: 2,
    views: 0,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-19',
  },
  {
    id: '3',
    name: 'Mobile App Onboarding',
    status: 'deployed',
    variants: 3,
    views: 567,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-17',
  },
  {
    id: '4',
    name: 'Settings Page v2',
    status: 'shared',
    variants: 2,
    views: 89,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-16',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'shared':
      return 'primary';
    case 'deployed':
      return 'success';
    default:
      return 'default';
  }
};

export function Prototypes() {
  const navigate = useNavigate();
  const { showSuccess } = useSnackbar();
  const { config, mode } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPrototypeName, setNewPrototypeName] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, prototype: Prototype) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPrototype(prototype);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPrototype(null);
  };

  const handleCreatePrototype = () => {
    if (!newPrototypeName.trim()) return;
    // In a real app, this would create the prototype and navigate to it
    const newId = Date.now().toString();
    showSuccess('Prototype created successfully');
    setCreateDialogOpen(false);
    setNewPrototypeName('');
    navigate(`/prototypes/${newId}`);
  };

  const filteredPrototypes = mockPrototypes.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (tabValue === 0) return matchesSearch;
    if (tabValue === 1) return matchesSearch && p.status === 'draft';
    if (tabValue === 2) return matchesSearch && p.status === 'shared';
    if (tabValue === 3) return matchesSearch && p.status === 'deployed';
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
          <Tab label="Shared" />
          <Tab label="Deployed" />
        </Tabs>
      </Box>

      {/* Grid */}
      {filteredPrototypes.length === 0 ? (
        <EmptyState
          title="No prototypes found"
          description={searchQuery ? 'Try a different search term' : 'Create your first prototype to get started'}
          action={
            !searchQuery
              ? { label: 'Create Prototype', onClick: () => setCreateDialogOpen(true) }
              : undefined
          }
        />
      ) : (
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
                secondaryInfo={`${prototype.variants} variants · ${prototype.views} views`}
                status={{
                  label: prototype.status,
                  color: getStatusColor(prototype.status),
                }}
                onClick={() => navigate(`/prototypes/${prototype.id}`)}
                onMenuClick={(e) => handleMenuOpen(e, prototype)}
                primaryAction={{
                  icon: <Flask size={24} color="white" weight="fill" />,
                  label: 'Open Prototype',
                  onClick: () => navigate(`/prototypes/${prototype.id}`),
                }}
              />
            </Grid>
          ))}
        </Grid>
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
          onClick={() => { handleMenuClose(); navigate(`/prototypes/${selectedPrototype?.id}`); }}
          sx={{ transition: 'all 0.15s ease' }}
        >
          <ListItemIcon><PencilSimple size={18} color={config.colors.primary} /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ transition: 'all 0.15s ease' }}>
          <ListItemIcon><Copy size={18} color={config.colors.textSecondary} /></ListItemIcon>
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ transition: 'all 0.15s ease' }}>
          <ListItemIcon><ShareNetwork size={18} color={config.colors.textSecondary} /></ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: config.colors.error, transition: 'all 0.15s ease' }}>
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
          <TextField
            autoFocus
            fullWidth
            label="Prototype Name"
            value={newPrototypeName}
            onChange={(e) => setNewPrototypeName(e.target.value)}
            placeholder="e.g., E-commerce Checkout Flow"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePrototype}
            disabled={!newPrototypeName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
