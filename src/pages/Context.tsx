import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import FlagIcon from '@mui/icons-material/Flag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useSnackbar } from '@/components/SnackbarProvider';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface ContextItem {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'url';
  url?: string;
  createdAt: string;
}

interface ContextCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  items: ContextItem[];
}

// Initial mock data
const initialCategories: ContextCategory[] = [
  {
    id: 'goals',
    title: 'Goals / OKRs / Mission',
    description: 'Company objectives and key results',
    icon: <FlagIcon />,
    color: '#764ba2',
    items: [
      { id: '1', title: 'Q1 2024 OKRs', content: 'Increase user engagement by 25%...', type: 'text', createdAt: '2024-01-15' },
      { id: '2', title: 'Company Mission', content: 'To empower product teams...', type: 'text', createdAt: '2024-01-10' },
    ],
  },
  {
    id: 'kpis',
    title: 'KPIs',
    description: 'Key performance indicators and metrics',
    icon: <TrendingUpIcon />,
    color: '#52c41a',
    items: [
      { id: '3', title: 'Conversion Metrics', content: 'Current conversion rate: 3.2%...', type: 'text', createdAt: '2024-01-12' },
    ],
  },
  {
    id: 'backlog',
    title: 'Backlog / Opportunities',
    description: 'Product backlog and feature ideas',
    icon: <ListAltIcon />,
    color: '#faad14',
    items: [
      { id: '4', title: 'Feature Wishlist', content: 'Dark mode, Mobile app...', type: 'text', createdAt: '2024-01-08' },
      { id: '5', title: 'User Feedback Summary', content: 'Top requested features...', type: 'text', createdAt: '2024-01-05' },
    ],
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    description: 'Documentation and reference materials',
    icon: <MenuBookIcon />,
    color: '#667eea',
    items: [
      { id: '6', title: 'Design Guidelines', content: 'Brand colors, typography...', type: 'text', createdAt: '2024-01-01' },
      { id: '7', title: 'Competitor Analysis', content: 'https://notion.so/competitors', type: 'url', url: 'https://notion.so/competitors', createdAt: '2024-01-03' },
    ],
  },
];

export function Context() {
  const { showSuccess, showError } = useSnackbar();
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<ContextCategory | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContextItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ categoryId: string; itemId: string } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<{ categoryId: string; item: ContextItem } | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState<'text' | 'url'>('text');
  const [formUrl, setFormUrl] = useState('');

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  const handleOpenCategory = (category: ContextCategory) => {
    setSelectedCategory(category);
  };

  const handleCloseCategory = () => {
    setSelectedCategory(null);
  };

  const handleOpenAddDialog = () => {
    setEditItem(null);
    setFormTitle('');
    setFormContent('');
    setFormType('text');
    setFormUrl('');
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (item: ContextItem) => {
    setEditItem(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormType(item.type);
    setFormUrl(item.url || '');
    setAddDialogOpen(true);
    setAnchorEl(null);
  };

  const handleSaveItem = () => {
    if (!formTitle.trim()) {
      showError('Please enter a title');
      return;
    }

    if (formType === 'text' && !formContent.trim()) {
      showError('Please enter content');
      return;
    }

    if (formType === 'url' && !formUrl.trim()) {
      showError('Please enter a URL');
      return;
    }

    const newItem: ContextItem = {
      id: editItem?.id || Date.now().toString(),
      title: formTitle,
      content: formType === 'url' ? `Reference: ${formUrl}` : formContent,
      type: formType,
      url: formType === 'url' ? formUrl : undefined,
      createdAt: editItem?.createdAt || new Date().toISOString().split('T')[0],
    };

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === selectedCategory?.id) {
          if (editItem) {
            return {
              ...cat,
              items: cat.items.map((item) => (item.id === editItem.id ? newItem : item)),
            };
          } else {
            return {
              ...cat,
              items: [...cat.items, newItem],
            };
          }
        }
        return cat;
      })
    );

    // Update selectedCategory to reflect changes
    setSelectedCategory((prev) => {
      if (!prev) return null;
      if (editItem) {
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === editItem.id ? newItem : item)),
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, newItem],
        };
      }
    });

    showSuccess(editItem ? 'Item updated' : 'Item added');
    setAddDialogOpen(false);
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === itemToDelete.categoryId) {
          return {
            ...cat,
            items: cat.items.filter((item) => item.id !== itemToDelete.itemId),
          };
        }
        return cat;
      })
    );

    // Update selectedCategory to reflect changes
    setSelectedCategory((prev) => {
      if (!prev || prev.id !== itemToDelete.categoryId) return prev;
      return {
        ...prev,
        items: prev.items.filter((item) => item.id !== itemToDelete.itemId),
      };
    });

    showSuccess('Item deleted');
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, categoryId: string, item: ContextItem) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuItem({ categoryId, item });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItem(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Product Context
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {totalItems} items across {categories.length} categories
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> Add product context to help AI generate better, more relevant prototypes.
          This information will be used when generating designs with AI.
        </Typography>
      </Alert>

      {/* 2x2 Category Grid */}
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} md={6} key={category.id}>
            <Card
              sx={{
                height: 200,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardActionArea
                onClick={() => handleOpenCategory(category)}
                sx={{ height: '100%', p: 3 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': { fontSize: 28 },
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {category.description}
                    </Typography>
                    <Chip
                      label={`${category.items.length} items`}
                      size="small"
                      sx={{ backgroundColor: `${category.color}15`, color: category.color }}
                    />
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Category Detail Dialog */}
      <Dialog
        open={!!selectedCategory}
        onClose={handleCloseCategory}
        maxWidth="md"
        fullWidth
      >
        {selectedCategory && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: `${selectedCategory.color}15`,
                    color: selectedCategory.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedCategory.icon}
                </Box>
                <Typography variant="h6">{selectedCategory.title}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedCategory.items.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No items yet</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddDialog}
                    sx={{ mt: 2 }}
                  >
                    Add First Item
                  </Button>
                </Box>
              ) : (
                <List>
                  {selectedCategory.items.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        {item.type === 'url' ? <LinkIcon /> : <DescriptionIcon />}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          item.type === 'url'
                            ? item.url
                            : item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '')
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => handleMenuOpen(e, selectedCategory.id, item)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCategory}>Close</Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
              >
                Add Item
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add/Edit Item Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="Text"
                color={formType === 'text' ? 'primary' : 'default'}
                onClick={() => setFormType('text')}
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="URL"
                color={formType === 'url' ? 'primary' : 'default'}
                onClick={() => setFormType('url')}
                sx={{ cursor: 'pointer' }}
              />
            </Box>

            <TextField
              fullWidth
              label="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., Q1 2024 Goals"
            />

            {formType === 'text' ? (
              <TextField
                fullWidth
                label="Content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                multiline
                rows={6}
                placeholder="Enter your content here..."
              />
            ) : (
              <TextField
                fullWidth
                label="URL"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://..."
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveItem}>
            {editItem ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => menuItem && handleOpenEditDialog(menuItem.item)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuItem) {
              setItemToDelete({ categoryId: menuItem.categoryId, itemId: menuItem.item.id });
              setDeleteConfirmOpen(true);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        content="Are you sure you want to delete this item?"
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
