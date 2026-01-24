import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ScienceIcon from '@mui/icons-material/Science';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { EmptyState } from '@/components';
import { FileUpload } from '@/components/FileUpload';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useScreensStore } from '@/store/screensStore';
import { useAuthStore } from '@/store/authStore';
import type { CapturedScreen } from '@/types';

export function Screens() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccess, showError, showWarning } = useSnackbar();
  const {
    screens,
    isPreviewOpen,
    previewScreen,
    openPreview,
    closePreview,
    removeScreen,
    removeScreens,
    duplicateScreen,
    uploadScreen,
    initializeScreens,
    fetchFromSupabase,
    isLoading,
    selectedIds,
    toggleSelectScreen,
    selectAllScreens,
    clearSelection,
  } = useScreensStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [tags, setTags] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuScreen, setMenuScreen] = useState<CapturedScreen | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [screenToDelete, setScreenToDelete] = useState<CapturedScreen | null>(null);

  useEffect(() => {
    initializeScreens();
  }, [initializeScreens]);

  useEffect(() => {
    if (user?.id) {
      fetchFromSupabase();
    }
  }, [user?.id, fetchFromSupabase]);

  const filteredScreens = screens.filter(
    (screen) =>
      screen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screen.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, screen: CapturedScreen) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuScreen(screen);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuScreen(null);
  };

  const handleDeleteClick = (screen: CapturedScreen) => {
    setScreenToDelete(screen);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (screenToDelete) {
      await removeScreen(screenToDelete.id);
      showSuccess('Screen deleted');
    }
    setDeleteConfirmOpen(false);
    setScreenToDelete(null);
  };

  const handleFilesSelected = (files: FileList) => {
    const htmlFiles = Array.from(files).filter((f) => f.name.match(/\.html?$/i));
    if (htmlFiles.length !== files.length) {
      showWarning('Only HTML files are accepted');
    }
    setUploadingFiles((prev) => [...prev, ...htmlFiles]);
  };

  const handleUpload = async () => {
    if (uploadingFiles.length === 0) {
      showWarning('Please select at least one HTML file');
      return;
    }

    setIsUploading(true);
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      for (const file of uploadingFiles) {
        await uploadScreen(file, undefined, tagList);
      }
      showSuccess(`Successfully uploaded ${uploadingFiles.length} screen(s)`);
      setIsUploadModalOpen(false);
      setUploadingFiles([]);
      setTags('');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    await removeScreens(selectedIds);
    setIsSelectionMode(false);
    showSuccess(`Deleted ${selectedIds.length} screen(s)`);
  };

  const handleToggleSelectionMode = () => {
    if (isSelectionMode) {
      clearSelection();
    }
    setIsSelectionMode(!isSelectionMode);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredScreens.length) {
      clearSelection();
    } else {
      selectAllScreens();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const ScreenCard = ({ screen }: { screen: CapturedScreen }) => {
    const isSelected = selectedIds.includes(screen.id);

    const previewContent = screen.editedHtml ? (
      <iframe
        srcDoc={screen.editedHtml}
        style={{
          width: '200%',
          height: '200%',
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          pointerEvents: 'none',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        title={screen.name}
      />
    ) : screen.filePath ? (
      <iframe
        src={screen.filePath}
        style={{
          width: '200%',
          height: '200%',
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          pointerEvents: 'none',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        title={screen.name}
      />
    ) : (
      <InsertDriveFileIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.5)' }} />
    );

    const handleCardClick = () => {
      if (isSelectionMode) {
        toggleSelectScreen(screen.id);
      } else {
        openPreview(screen);
      }
    };

    return (
      <Card
        sx={{
          height: '100%',
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          '&:hover': { boxShadow: 3 },
        }}
      >
        <Box
          onClick={handleCardClick}
          sx={{
            height: 180,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {previewContent}

          {isSelectionMode && (
            <Box
              sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelectScreen(screen.id);
              }}
            >
              <Checkbox
                checked={isSelected}
                sx={{
                  color: 'white',
                  '&.Mui-checked': { color: 'white' },
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: 1,
                }}
              />
            </Box>
          )}

          {!isSelectionMode && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                opacity: 0,
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': { opacity: 1 },
              }}
            >
              <VisibilityIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
          )}
        </Box>

        <CardContent sx={{ py: 1.5 }}>
          <Typography variant="subtitle2" noWrap fontWeight={600}>
            {screen.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(screen.capturedAt)}
          </Typography>
          {screen.tags && screen.tags.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {screen.tags.slice(0, 3).map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          )}
        </CardContent>

        {!isSelectionMode && (
          <CardActions sx={{ px: 2, py: 1 }}>
            <Tooltip title="Preview">
              <IconButton size="small" onClick={() => openPreview(screen)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => navigate(`/editor/${screen.id}`)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, screen)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </CardActions>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Selection mode banner */}
      {isSelectionMode && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                disabled={selectedIds.length === 0}
                onClick={handleBatchDelete}
              >
                Delete Selected
              </Button>
              <Button
                size="small"
                startIcon={<CloseIcon />}
                onClick={handleToggleSelectionMode}
              >
                Cancel
              </Button>
            </Box>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Checkbox
              checked={selectedIds.length === filteredScreens.length && filteredScreens.length > 0}
              indeterminate={selectedIds.length > 0 && selectedIds.length < filteredScreens.length}
              onChange={handleSelectAll}
            />
            <Typography>
              {selectedIds.length} of {filteredScreens.length} selected
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Captured Screens
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Search screens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title={isSelectionMode ? 'Exit selection mode' : 'Select multiple'}>
            <IconButton
              onClick={handleToggleSelectionMode}
              color={isSelectionMode ? 'primary' : 'default'}
            >
              <CheckBoxIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Import Screen
          </Button>
        </Box>
      </Box>

      {/* Grid */}
      {filteredScreens.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No screens match your search' : 'No captured screens yet'}
          description={searchQuery ? 'Try a different search term' : 'Import HTML screens to get started'}
          action={
            !searchQuery
              ? { label: 'Import Your First Screen', onClick: () => setIsUploadModalOpen(true) }
              : undefined
          }
        />
      ) : (
        <Grid container spacing={2}>
          {filteredScreens.map((screen) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={screen.id}>
              <ScreenCard screen={screen} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); menuScreen && openPreview(menuScreen); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          Preview
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); menuScreen && navigate(`/editor/${menuScreen.id}`); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          Edit in WYSIWYG
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); menuScreen && navigate(`/variants/${menuScreen.id}`); }}>
          <ListItemIcon><ScienceIcon fontSize="small" /></ListItemIcon>
          Create Variants
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); menuScreen && navigate(`/vibe/${menuScreen.id}`); }}>
          <ListItemIcon><AutoFixHighIcon fontSize="small" /></ListItemIcon>
          Vibe Prototype
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); menuScreen && duplicateScreen(menuScreen.id); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => menuScreen && handleDeleteClick(menuScreen)} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import HTML Screens</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FileUpload
              accept=".html,.htm"
              multiple
              onFilesSelected={handleFilesSelected}
              title="Click or drag HTML files here"
              description="Upload captured screens from SingleFile or any HTML files"
            />

            {uploadingFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected files ({uploadingFiles.length}):
                </Typography>
                {uploadingFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => setUploadingFiles((prev) => prev.filter((_, i) => i !== index))}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            )}

            <TextField
              fullWidth
              label="Tags (optional)"
              placeholder="e.g., landing, dashboard, mobile"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              helperText="Comma-separated tags for organization"
              sx={{ mt: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploadingFiles.length === 0 || isUploading}
          >
            {isUploading ? <CircularProgress size={20} /> : `Upload (${uploadingFiles.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Modal */}
      <Dialog
        open={isPreviewOpen}
        onClose={closePreview}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle>{previewScreen?.name}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {previewScreen && (
            <Box sx={{ height: 'calc(100% - 20px)', border: '1px solid', borderColor: 'divider' }}>
              {previewScreen.editedHtml ? (
                <iframe
                  srcDoc={previewScreen.editedHtml}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={previewScreen.name}
                />
              ) : (
                <iframe
                  src={previewScreen.filePath}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={previewScreen.name}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              previewScreen && duplicateScreen(previewScreen.id);
              closePreview();
            }}
          >
            Duplicate
          </Button>
          <Button
            startIcon={<AutoFixHighIcon />}
            onClick={() => {
              previewScreen && navigate(`/vibe/${previewScreen.id}`);
              closePreview();
            }}
          >
            Vibe Prototype
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              previewScreen && navigate(`/editor/${previewScreen.id}`);
              closePreview();
            }}
          >
            Edit in WYSIWYG
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Screen"
        content={`Are you sure you want to delete "${screenToDelete?.name}"?`}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
