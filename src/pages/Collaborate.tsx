import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import {
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Chip,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@/components/ui';

import { useSnackbar } from '@/components/SnackbarProvider';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState, PageHeader } from '@/components';
import {
  useMultiplayerStore,
  formatRelativeTime,
  type PublishedPrototype,
} from '@/store/multiplayerStore';
import { useScreensStore } from '@/store/screensStore';

// Publish Modal
function PublishModal({
  open,
  onClose,
  screenId,
  screenName,
  filePath,
  variantId,
}: {
  open: boolean;
  onClose: () => void;
  screenId: string;
  screenName: string;
  filePath: string;
  variantId?: string;
}) {
  const [name, setName] = useState(screenName);
  const { publishPrototype } = useMultiplayerStore();
  const { showSuccess, showInfo, showError } = useSnackbar();

  const handlePublish = () => {
    if (!name.trim()) {
      showError('Please provide a name');
      return;
    }

    // Store filePath as html - SharedView will use src instead of srcDoc
    const prototype = publishPrototype(screenId, name, filePath, variantId);
    showSuccess('Prototype published!');
    onClose();

    // Copy share link
    const shareUrl = `${window.location.origin}/view/${prototype.shareLink}`;
    navigator.clipboard.writeText(shareUrl);
    showInfo('Share link copied to clipboard');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShareOutlinedIcon color="primary" />
        Publish Prototype
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prototype name"
          />
          <Box
            sx={{
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Publishing will create a shareable link that you can send to collaborators.
              They can view and comment on the prototype.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handlePublish}>
          Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Share Settings Modal
function ShareSettingsModal({
  prototype,
  onClose,
}: {
  prototype: PublishedPrototype | null;
  onClose: () => void;
}) {
  const { updatePrototype, addCollaborator, removeCollaborator, updateCollaboratorRole } =
    useMultiplayerStore();
  const { showSuccess } = useSnackbar();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer');

  if (!prototype) return null;

  const shareUrl = `${window.location.origin}/view/${prototype.shareLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showSuccess('Link copied!');
  };

  const handleAddCollaborator = () => {
    if (!email.trim()) return;

    addCollaborator(prototype.id, {
      name: email.split('@')[0],
      email,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      role,
    });
    setEmail('');
    showSuccess('Collaborator added');
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GroupIcon color="primary" />
        Share Settings
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Share Link */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Share Link</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={shareUrl}
                InputProps={{ readOnly: true }}
              />
              <Button
                variant="outlined"
                startIcon={<ContentCopyOutlinedIcon />}
                onClick={handleCopyLink}
              >
                Copy
              </Button>
            </Box>
          </Box>

          {/* Privacy */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {prototype.isPublic ? (
                <PublicIcon sx={{ color: 'success.main' }} />
              ) : (
                <LockIcon sx={{ color: 'warning.main' }} />
              )}
              <Box>
                <Typography fontWeight={500}>Public access</Typography>
                <Typography variant="caption" color="text.secondary">
                  {prototype.isPublic
                    ? 'Anyone with the link can view'
                    : 'Only collaborators can access'}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={prototype.isPublic}
              onChange={(e) => updatePrototype(prototype.id, { isPublic: e.target.checked })}
            />
          </Box>

          {/* Comments */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CommentIcon color="action" />
              <Box>
                <Typography fontWeight={500}>Allow comments</Typography>
                <Typography variant="caption" color="text.secondary">
                  Collaborators can leave feedback
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={prototype.allowComments}
              onChange={(e) => updatePrototype(prototype.id, { allowComments: e.target.checked })}
            />
          </Box>

          <Divider />

          {/* Add Collaborator */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Add people</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select value={role} onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}>
                  <MenuItem value="viewer">Viewer</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handleAddCollaborator}>
                Add
              </Button>
            </Box>
          </Box>

          {/* Collaborators List */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Collaborators ({prototype.collaborators.length})
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {prototype.collaborators.map((collab) => (
                <Box
                  key={collab.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      color={collab.isOnline ? 'success' : 'default'}
                    >
                      <Avatar sx={{ bgcolor: collab.color, width: 32, height: 32 }}>
                        {collab.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="body2">{collab.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {collab.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {collab.role === 'owner' ? (
                      <Chip label="Owner" size="small" />
                    ) : (
                      <>
                        <Select
                          size="small"
                          value={collab.role}
                          onChange={(e) =>
                            updateCollaboratorRole(prototype.id, collab.id, e.target.value as 'editor' | 'viewer')
                          }
                          sx={{ minWidth: 85 }}
                        >
                          <MenuItem value="viewer">Viewer</MenuItem>
                          <MenuItem value="editor">Editor</MenuItem>
                        </Select>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeCollaborator(prototype.id, collab.id)}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

// Prototype Card
function PrototypeCard({ prototype }: { prototype: PublishedPrototype }) {
  const navigate = useNavigate();
  const { unpublishPrototype, getCommentsForPrototype } = useMultiplayerStore();
  const { showSuccess } = useSnackbar();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const comments = getCommentsForPrototype(prototype.id);
  const onlineCount = prototype.collaborators.filter((c) => c.isOnline).length;

  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          sx={{
            height: 160,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/view/${prototype.shareLink}`)}
        >
          <iframe
            src={prototype.html}
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
            title={prototype.name}
          />
          {/* Online indicator */}
          {onlineCount > 1 && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.6)',
                borderRadius: 3,
                px: 1,
                py: 0.25,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Badge variant="dot" color="success" />
              <Typography variant="caption" sx={{ color: 'white' }}>
                {onlineCount} online
              </Typography>
            </Box>
          )}
        </CardMedia>

        <CardContent sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {prototype.name}
            </Typography>
            {prototype.isPublic ? (
              <PublicIcon sx={{ color: 'success.main', fontSize: 16 }} />
            ) : (
              <LockIcon sx={{ color: 'warning.main', fontSize: 16 }} />
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Published {formatRelativeTime(prototype.publishedAt)}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {prototype.collaborators.length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CommentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {comments.length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {prototype.viewCount}
              </Typography>
            </Box>
          </Box>

          {/* Collaborator avatars */}
          <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
            {prototype.collaborators.map((collab) => (
              <Tooltip key={collab.id} title={collab.name}>
                <Avatar sx={{ bgcolor: collab.color, width: 24, height: 24, fontSize: 12 }}>
                  {collab.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </CardContent>

        <CardActions>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`/view/${prototype.shareLink}`)}>
              <VisibilityOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton size="small" onClick={() => setShareModalOpen(true)}>
              <ShareOutlinedIcon />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertOutlinedIcon />
          </IconButton>
        </CardActions>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { navigate(`/view/${prototype.shareLink}`); handleMenuClose(); }}>
          <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setShareModalOpen(true); handleMenuClose(); }}>
          <ListItemIcon><ShareOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Share Settings</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/view/${prototype.shareLink}`);
            showSuccess('Link copied!');
            handleMenuClose();
          }}
        >
          <ListItemIcon><ContentCopyOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => { setDeleteConfirmOpen(true); handleMenuClose(); }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteOutlinedIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Unpublish</ListItemText>
        </MenuItem>
      </Menu>

      {shareModalOpen && (
        <ShareSettingsModal prototype={prototype} onClose={() => setShareModalOpen(false)} />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          unpublishPrototype(prototype.id);
          setDeleteConfirmOpen(false);
        }}
        title="Unpublish Prototype"
        content="This will remove the shared link and all comments. Continue?"
        confirmText="Unpublish"
        confirmColor="error"
      />
    </>
  );
}

export function Collaborate() {
  const { publishedPrototypes } = useMultiplayerStore();
  const { screens } = useScreensStore();
  const { showInfo } = useSnackbar();
  const [selectScreenOpen, setSelectScreenOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<{
    id: string;
    name: string;
    filePath: string;
  } | null>(null);

  const handlePublishClick = () => {
    if (screens.length === 0) {
      showInfo('No screens available. Capture some screens first.');
      return;
    }
    setSelectScreenOpen(true);
  };

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Collaborate"
        subtitle={`${publishedPrototypes.length} published prototype${publishedPrototypes.length !== 1 ? 's' : ''}`}
        actions={
          <Button
            variant="contained"
            startIcon={<ShareOutlinedIcon />}
            onClick={handlePublishClick}
          >
            Publish Prototype
          </Button>
        }
      />

      {/* Info Card */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
        }}
      >
        <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Box>
            <Typography variant="body2">
              <strong>Real-time collaboration:</strong>{' '}
              Publish prototypes to share with your team. Collaborators can view, comment, and
              provide feedback in real-time.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Published Prototypes */}
      {publishedPrototypes.length === 0 ? (
        <EmptyState
          title="No published prototypes"
          description="Publish a prototype to start collaborating with your team"
          action={{ label: 'Publish Your First Prototype', onClick: handlePublishClick }}
        />
      ) : (
        <Grid container spacing={2}>
          {publishedPrototypes.map((prototype) => (
            <Grid item key={prototype.id} xs={12} sm={6} md={4} lg={3}>
              <PrototypeCard prototype={prototype} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Select Screen Modal */}
      <Dialog open={selectScreenOpen} onClose={() => setSelectScreenOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Screen to Publish</DialogTitle>
        <DialogContent>
          {screens.length === 0 ? (
            <EmptyState title="No screens available" description="Capture some screens first" />
          ) : (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {screens.map((screen) => (
                <Card
                  key={screen.id}
                  sx={{
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => {
                    setSelectedScreen({
                      id: screen.id,
                      name: screen.name,
                      filePath: screen.filePath,
                    });
                    setSelectScreenOpen(false);
                  }}
                >
                  <CardContent sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <iframe
                        src={screen.filePath}
                        style={{
                          width: '200%',
                          height: '200%',
                          transform: 'scale(0.25)',
                          transformOrigin: 'top left',
                          pointerEvents: 'none',
                          border: 'none',
                        }}
                        title={screen.name}
                      />
                    </Box>
                    <Typography>{screen.name}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectScreenOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {selectedScreen && (
        <PublishModal
          open={true}
          onClose={() => setSelectedScreen(null)}
          screenId={selectedScreen.id}
          screenName={selectedScreen.name}
          filePath={selectedScreen.filePath}
        />
      )}
    </Box>
  );
}
