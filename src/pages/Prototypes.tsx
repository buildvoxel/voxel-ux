import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ScienceIcon from '@mui/icons-material/Science';
import { EmptyState } from '@/components';
import { useSnackbar } from '@/components/SnackbarProvider';

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
        <Typography variant="h4" fontWeight={600}>
          Prototypes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
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
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
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
        <Grid container spacing={3}>
          {filteredPrototypes.map((prototype) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={prototype.id}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea onClick={() => navigate(`/prototypes/${prototype.id}`)}>
                  <Box
                    sx={{
                      height: 160,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <ScienceIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.5)' }} />
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <Chip
                        label={prototype.status}
                        size="small"
                        color={getStatusColor(prototype.status)}
                        sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                      />
                    </Box>
                  </Box>
                </CardActionArea>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {prototype.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {prototype.variants} variants · {prototype.views} views
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Updated {formatDate(prototype.updatedAt)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, prototype)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate(`/prototypes/${selectedPrototype?.id}`); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
          Share
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Prototype</DialogTitle>
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
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
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
