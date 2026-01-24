import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

import { EmptyState } from '@/components';
import {
  useMultiplayerStore,
  formatRelativeTime,
  type Comment,
} from '@/store/multiplayerStore';

// Comment component for the sidebar
function CommentItem({
  comment,
  prototypeId,
}: {
  comment: Comment;
  prototypeId: string;
}) {
  const { addComment, deleteComment, resolveComment, getReplies, currentUser } =
    useMultiplayerStore();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const replies = getReplies(comment.id);
  const isOwner = currentUser?.id === comment.userId;

  const handleReply = () => {
    if (!replyText.trim()) return;
    addComment(prototypeId, replyText, undefined, comment.id);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: comment.resolved ? 'success.lighter' : 'grey.100',
        mb: 1.5,
        opacity: comment.resolved ? 0.7 : 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: 12 }}>
            {comment.userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {comment.userName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(comment.createdAt)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {comment.resolved && (
            <Chip label="Resolved" size="small" color="success" sx={{ height: 20 }} />
          )}
          <Tooltip title={comment.resolved ? 'Reopen' : 'Resolve'}>
            <IconButton
              size="small"
              onClick={() => resolveComment(comment.id)}
            >
              {comment.resolved ? <CloseIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          {isOwner && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => deleteComment(comment.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {comment.content}
      </Typography>

      {/* Position indicator */}
      {comment.position && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          📍 Position: ({Math.round(comment.position.x)}, {Math.round(comment.position.y)})
        </Typography>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <Box sx={{ mt: 1.5, pl: 1.5, borderLeft: '2px solid', borderColor: 'divider' }}>
          {replies.map((reply) => (
            <Box key={reply.id} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 20, height: 20, bgcolor: 'success.main', fontSize: 10 }}>
                  {reply.userName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" fontWeight={600}>
                  {reply.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatRelativeTime(reply.createdAt)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 3.5, fontSize: 12 }}>
                {reply.content}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Reply Input */}
      {isReplying ? (
        <Box sx={{ mt: 1.5 }}>
          <TextField
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            size="small"
            autoFocus
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button size="small" onClick={() => setIsReplying(false)}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={handleReply}>
              Reply
            </Button>
          </Box>
        </Box>
      ) : (
        <Button
          size="small"
          onClick={() => setIsReplying(true)}
          sx={{ mt: 1, p: 0, minWidth: 0 }}
        >
          Reply
        </Button>
      )}
    </Box>
  );
}

export function SharedView() {
  const { shareLink } = useParams<{ shareLink: string }>();
  const navigate = useNavigate();
  const {
    getPrototypeByShareLink,
    updatePrototype,
    addComment,
    getCommentsForPrototype,
    simulatePresence,
  } = useMultiplayerStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentMode, setCommentMode] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const prototype = shareLink ? getPrototypeByShareLink(shareLink) : undefined;

  // Simulate presence on mount
  useEffect(() => {
    if (prototype) {
      // Increment view count
      updatePrototype(prototype.id, { viewCount: prototype.viewCount + 1 });

      // Simulate other users
      simulatePresence(prototype.id);

      // Simulate presence updates every 10 seconds
      const interval = setInterval(() => {
        simulatePresence(prototype.id);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [prototype?.id]);

  if (!prototype) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <EmptyState
          title="Prototype not found"
          description="The prototype you're looking for doesn't exist or has been removed."
          action={{ label: 'Go to Collaborate', onClick: () => navigate('/collaborate') }}
        />
      </Box>
    );
  }

  const comments = getCommentsForPrototype(prototype.id);
  const filteredComments = showResolved
    ? comments
    : comments.filter((c) => !c.resolved);
  const onlineCollaborators = prototype.collaborators.filter((c) => c.isOnline);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(prototype.id, newComment);
    setNewComment('');
  };

  const handleIframeClick = (e: React.MouseEvent) => {
    if (!commentMode || !prototype.allowComments) return;

    const rect = iframeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const comment = prompt('Add a comment at this position:');
    if (comment) {
      addComment(prototype.id, comment, { x, y });
    }
    setCommentMode(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          py: 1.5,
          px: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/collaborate')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography fontWeight={600}>{prototype.name}</Typography>
          <Chip
            label={prototype.isPublic ? 'Public' : 'Private'}
            size="small"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Online collaborators */}
          {onlineCollaborators.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AvatarGroup max={5}>
                {onlineCollaborators.map((collab) => (
                  <Tooltip key={collab.id} title={`${collab.name} (online)`}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      color="success"
                    >
                      <Avatar sx={{ bgcolor: collab.color, width: 28, height: 28, fontSize: 12 }}>
                        {collab.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </Tooltip>
                ))}
              </AvatarGroup>
              <Typography variant="caption" color="text.secondary">
                {onlineCollaborators.length} online
              </Typography>
            </Box>
          )}

          <Divider orientation="vertical" flexItem />

          {prototype.allowComments && (
            <Tooltip title="Click on prototype to add comment">
              <Button
                variant={commentMode ? 'contained' : 'outlined'}
                startIcon={<CommentIcon />}
                onClick={() => setCommentMode(!commentMode)}
                size="small"
              >
                Add Pin
              </Button>
            </Tooltip>
          )}

          <IconButton onClick={toggleFullscreen}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>

          <Button
            variant={sidebarOpen ? 'contained' : 'outlined'}
            startIcon={<CommentIcon />}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            size="small"
          >
            {comments.length}
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Prototype viewer */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            bgcolor: 'grey.100',
            overflow: 'auto',
          }}
          onClick={handleIframeClick}
        >
          {/* Cursor overlay for comment mode */}
          {commentMode && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                cursor: 'crosshair',
                zIndex: 10,
                bgcolor: 'rgba(102, 126, 234, 0.05)',
              }}
            />
          )}

          {/* Simulated cursors */}
          {onlineCollaborators
            .filter((c) => c.cursor && c.id !== 'user-current')
            .map((collab) => (
              <Box
                key={collab.id}
                sx={{
                  position: 'absolute',
                  left: collab.cursor!.x,
                  top: collab.cursor!.y + 60, // Offset for header
                  zIndex: 20,
                  pointerEvents: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={collab.color}>
                  <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 01.35-.15h6.87a.5.5 0 00.35-.85L6.35 2.86a.5.5 0 00-.85.35z" />
                </svg>
                <Box
                  component="span"
                  sx={{
                    bgcolor: collab.color,
                    color: 'white',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: 11,
                    ml: 0.25,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {collab.name}
                </Box>
              </Box>
            ))}

          {/* Comment pins on the prototype */}
          {comments
            .filter((c) => c.position && !c.resolved)
            .map((comment, index) => (
              <Tooltip
                key={comment.id}
                title={
                  <Box>
                    <Typography variant="caption" fontWeight={600}>
                      {comment.userName}
                    </Typography>
                    <br />
                    {comment.content.substring(0, 50)}
                    {comment.content.length > 50 && '...'}
                  </Box>
                }
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: comment.position!.x,
                    top: comment.position!.y + 60,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: 2,
                    zIndex: 15,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(true);
                  }}
                >
                  {index + 1}
                </Box>
              </Tooltip>
            ))}

          <iframe
            ref={iframeRef}
            src={prototype.html}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'white',
            }}
            title={prototype.name}
          />
        </Box>

        {/* Comments sidebar */}
        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant="persistent"
          sx={{
            width: 360,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 360,
              position: 'relative',
              height: '100%',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CommentIcon />
                <Typography fontWeight={600}>Comments ({comments.length})</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showResolved}
                    onChange={(e) => setShowResolved(e.target.checked)}
                  />
                }
                label={<Typography variant="caption">Show resolved</Typography>}
              />
            </Box>
          </Box>

          <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
            {/* New comment input */}
            {prototype.allowComments && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  multiline
                  minRows={2}
                  maxRows={4}
                  fullWidth
                  size="small"
                />
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Post Comment
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 1.5 }} />

            {/* Comments list */}
            {filteredComments.length === 0 ? (
              <EmptyState
                title={showResolved ? 'No comments yet' : 'No unresolved comments'}
                description="Be the first to leave feedback"
              />
            ) : (
              filteredComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  prototypeId={prototype.id}
                />
              ))
            )}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
}
