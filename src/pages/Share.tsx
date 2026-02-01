/**
 * Share Page - Public view for shared prototypes with commenting
 * No authentication required
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Card, Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@/components/ui';
import {
  Sparkle,
  Warning,
  ChatCircle,
  X,
  PushPin,
  Check,
  CheckCircle,
  ArrowBendUpLeft,
  DotsThree,
  User,
} from '@phosphor-icons/react';
import { getShareData, recordShareView, type ShareData } from '@/services/sharingService';
import {
  getComments,
  addComment,
  toggleCommentResolved,
  deleteComment,
  subscribeToComments,
  unsubscribeFromComments,
  type CommentWithReplies,
  type CommentChangeEvent,
} from '@/services/commentService';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Local storage key for user info
const USER_INFO_KEY = 'voxel_share_user';

interface UserInfo {
  name: string;
  email: string;
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  // Comment state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Pin mode state
  const [pinMode, setPinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pinComment, setPinComment] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  // User info state
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem(USER_INFO_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [userInfoDialogOpen, setUserInfoDialogOpen] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState<UserInfo>({ name: '', email: '' });
  const [pendingAction, setPendingAction] = useState<'comment' | 'pin' | null>(null);

  // Comment menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<CommentWithReplies | null>(null);

  // Real-time subscription
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Load share data
  useEffect(() => {
    async function loadShare() {
      if (!token) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const data = await getShareData(token);

        if (!data) {
          setError('Share link not found or has expired');
          setLoading(false);
          return;
        }

        setShareData(data);

        // If html_url is a URL, fetch the content to avoid sandbox restrictions
        if (data.variant.html_url && data.variant.html_url.startsWith('http')) {
          try {
            const response = await fetch(data.variant.html_url);
            if (response.ok) {
              const html = await response.text();
              setHtmlContent(html);
            }
          } catch (fetchErr) {
            console.error('Error fetching HTML content:', fetchErr);
          }
        } else if (data.variant.html_url) {
          setHtmlContent(data.variant.html_url);
        }

        // Record the view for analytics
        await recordShareView(data.share.id, data.variant.index);

        // Load comments
        loadComments();
      } catch (err) {
        console.error('Error loading share:', err);
        setError('Failed to load shared prototype');
      } finally {
        setLoading(false);
      }
    }

    loadShare();
  }, [token]);

  // Load comments
  const loadComments = useCallback(async () => {
    if (!token) return;

    setLoadingComments(true);
    try {
      const fetchedComments = await getComments(token);
      setComments(fetchedComments);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [token]);

  // Subscribe to real-time comments
  useEffect(() => {
    if (!shareData?.share.id) return;

    const handleCommentChange = (event: CommentChangeEvent) => {
      if (event.eventType === 'INSERT') {
        // Reload comments to get proper threading
        loadComments();
      } else if (event.eventType === 'UPDATE') {
        setComments((prev) =>
          prev.map((c) => (c.id === event.comment.id ? { ...c, ...event.comment } : c))
        );
      } else if (event.eventType === 'DELETE') {
        setComments((prev) => prev.filter((c) => c.id !== event.comment.id));
      }
    };

    channelRef.current = subscribeToComments(shareData.share.id, handleCommentChange);

    return () => {
      if (channelRef.current) {
        unsubscribeFromComments(channelRef.current);
      }
    };
  }, [shareData?.share.id, loadComments]);

  // Handle user info submission
  const handleUserInfoSubmit = () => {
    if (!tempUserInfo.name.trim() || !tempUserInfo.email.trim()) return;

    const info = { name: tempUserInfo.name.trim(), email: tempUserInfo.email.trim() };
    setUserInfo(info);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
    setUserInfoDialogOpen(false);

    // Execute pending action
    if (pendingAction === 'comment') {
      handleSubmitComment();
    } else if (pendingAction === 'pin' && pendingPin) {
      handleSubmitPinComment();
    }
    setPendingAction(null);
  };

  // Ensure user info before action
  const ensureUserInfo = (action: 'comment' | 'pin'): boolean => {
    if (!userInfo) {
      setPendingAction(action);
      setTempUserInfo({ name: '', email: '' });
      setUserInfoDialogOpen(true);
      return false;
    }
    return true;
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!token || !newComment.trim()) return;
    if (!ensureUserInfo('comment')) return;
    if (!userInfo) return;

    setSubmittingComment(true);
    try {
      await addComment({
        shareToken: token,
        content: newComment.trim(),
        userEmail: userInfo.email,
        userName: userInfo.name,
        variantIndex: shareData?.variant.index,
      });
      setNewComment('');
      await loadComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (parentId: string) => {
    if (!token || !replyContent.trim()) return;
    if (!ensureUserInfo('comment')) return;
    if (!userInfo) return;

    setSubmittingComment(true);
    try {
      await addComment({
        shareToken: token,
        content: replyContent.trim(),
        userEmail: userInfo.email,
        userName: userInfo.name,
        variantIndex: shareData?.variant.index,
        parentId,
      });
      setReplyContent('');
      setReplyingTo(null);
      await loadComments();
    } catch (err) {
      console.error('Error adding reply:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle pin click on preview
  const handlePreviewClick = (e: React.MouseEvent) => {
    if (!pinMode || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPendingPin({ x, y });
    setPinComment('');
  };

  // Handle pin comment submission
  const handleSubmitPinComment = async () => {
    if (!token || !pendingPin || !pinComment.trim()) return;
    if (!ensureUserInfo('pin')) return;
    if (!userInfo) return;

    setSubmittingComment(true);
    try {
      await addComment({
        shareToken: token,
        content: pinComment.trim(),
        userEmail: userInfo.email,
        userName: userInfo.name,
        positionX: pendingPin.x,
        positionY: pendingPin.y,
        variantIndex: shareData?.variant.index,
      });
      setPendingPin(null);
      setPinComment('');
      setPinMode(false);
      await loadComments();
    } catch (err) {
      console.error('Error adding pin comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle resolve toggle
  const handleToggleResolved = async (comment: CommentWithReplies) => {
    try {
      await toggleCommentResolved(comment.id, !comment.resolved);
      await loadComments();
    } catch (err) {
      console.error('Error toggling resolved:', err);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (comment: CommentWithReplies) => {
    try {
      await deleteComment(comment.id);
      await loadComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
    setMenuAnchorEl(null);
    setSelectedComment(null);
  };

  // Get pin comments (comments with positions)
  const pinComments = comments.filter((c) => c.position_x !== null && c.position_y !== null);

  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading prototype...</Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error || !shareData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
        }}
      >
        <Card sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Warning size={48} color="#f57c00" style={{ marginBottom: 16 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            {error || 'Share not found'}
          </Typography>
          <Typography color="text.secondary">
            This share link may have expired or been deactivated.
          </Typography>
        </Card>
      </Box>
    );
  }

  const { session, variant, share } = shareData;
  const variantLetter = String.fromCharCode(64 + variant.index);
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fafafa',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 1.5,
              py: 0.75,
              borderRadius: 1,
            }}
          >
            <Sparkle size={18} color="white" weight="fill" />
            <Typography
              variant="subtitle2"
              sx={{
                color: 'white',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Voxel
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {session.name || 'Shared Prototype'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Variant {variantLetter}: {variant.title}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label={`Variant ${variantLetter}`}
            sx={{
              bgcolor: 'rgba(118, 75, 162, 0.1)',
              color: '#764ba2',
              fontWeight: 600,
            }}
          />
          {share.type === 'random' && (
            <Chip
              size="small"
              label="Random"
              sx={{
                bgcolor: 'rgba(255, 193, 7, 0.2)',
                color: '#f57c00',
                fontWeight: 500,
              }}
            />
          )}

          {/* Pin mode toggle */}
          <Tooltip title={pinMode ? 'Exit pin mode' : 'Add pin comment'}>
            <IconButton
              onClick={() => setPinMode(!pinMode)}
              sx={{
                bgcolor: pinMode ? 'primary.main' : 'transparent',
                color: pinMode ? 'white' : 'text.secondary',
                '&:hover': { bgcolor: pinMode ? 'primary.dark' : 'action.hover' },
              }}
            >
              <PushPin size={20} weight={pinMode ? 'fill' : 'regular'} />
            </IconButton>
          </Tooltip>

          {/* Comments toggle */}
          <Tooltip title="Comments">
            <IconButton onClick={() => setCommentsOpen(true)}>
              <Badge badgeContent={unresolvedCount} color="primary">
                <ChatCircle size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User info */}
          {userInfo && (
            <Tooltip title={`${userInfo.name} (${userInfo.email})`}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 12,
                  bgcolor: 'primary.main',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setTempUserInfo(userInfo);
                  setUserInfoDialogOpen(true);
                }}
              >
                {getInitials(userInfo.name)}
              </Avatar>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Variant Info */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {variant.description}
        </Typography>
      </Box>

      {/* Main Preview */}
      <Box
        ref={previewRef}
        onClick={handlePreviewClick}
        sx={{
          flex: 1,
          position: 'relative',
          cursor: pinMode ? 'crosshair' : 'default',
        }}
      >
        {/* Pin overlay */}
        {pinComments.map((pin, idx) => (
          <Tooltip
            key={pin.id}
            title={
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  {pin.user_name}
                </Typography>
                <Typography variant="caption" display="block">
                  {pin.content}
                </Typography>
              </Box>
            }
          >
            <Box
              onClick={(e) => {
                e.stopPropagation();
                setCommentsOpen(true);
              }}
              sx={{
                position: 'absolute',
                left: `${pin.position_x}%`,
                top: `${pin.position_y}%`,
                transform: 'translate(-50%, -50%)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: pin.resolved ? 'success.main' : 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: 2,
                '&:hover': { transform: 'translate(-50%, -50%) scale(1.1)' },
              }}
            >
              {idx + 1}
            </Box>
          </Tooltip>
        ))}

        {/* Pending pin */}
        {pendingPin && (
          <Box
            sx={{
              position: 'absolute',
              left: `${pendingPin.x}%`,
              top: `${pendingPin.y}%`,
              transform: 'translate(-50%, -100%)',
              zIndex: 20,
            }}
          >
            <Card sx={{ p: 2, width: 280, boxShadow: 4 }}>
              <TextField
                autoFocus
                multiline
                rows={2}
                placeholder="Add your comment..."
                value={pinComment}
                onChange={(e) => setPinComment(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 1.5 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    setPendingPin(null);
                    setPinComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!pinComment.trim() || submittingComment}
                  onClick={handleSubmitPinComment}
                >
                  {submittingComment ? 'Adding...' : 'Add Pin'}
                </Button>
              </Box>
            </Card>
          </Box>
        )}

        {/* Prototype preview */}
        {share.shareWireframes ? (
          variant.wireframe_url ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f5f5f5',
                p: 4,
              }}
            >
              <img
                src={variant.wireframe_url}
                alt={`Wireframe - Variant ${variantLetter}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  pointerEvents: pinMode ? 'none' : 'auto',
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">No wireframe available</Typography>
            </Box>
          )
        ) : htmlContent ? (
          <iframe
            srcDoc={htmlContent}
            title={`${session.name} - Variant ${variantLetter}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: pinMode ? 'none' : 'auto',
            }}
          />
        ) : variant.html_url ? (
          <iframe
            src={variant.html_url}
            title={`${session.name} - Variant ${variantLetter}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: pinMode ? 'none' : 'auto',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">No preview available</Typography>
          </Box>
        )}

        {/* Pin mode overlay hint */}
        {pinMode && !pendingPin && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <PushPin size={16} />
            <Typography variant="body2">Click anywhere to add a pin comment</Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: 'white',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Sparkle size={14} color="#764ba2" weight="fill" />
        <Typography variant="caption" color="text.secondary">
          Created with{' '}
          <Typography
            component="a"
            href="/"
            variant="caption"
            sx={{ color: '#764ba2', textDecoration: 'none', fontWeight: 500 }}
          >
            Voxel
          </Typography>
        </Typography>
      </Box>

      {/* Comments Drawer */}
      <Drawer
        anchor="right"
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        PaperProps={{ sx: { width: 400, maxWidth: '100vw' } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Drawer Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatCircle size={20} weight="fill" />
              <Typography variant="subtitle1" fontWeight={600}>
                Comments
              </Typography>
              {comments.length > 0 && (
                <Chip size="small" label={comments.length} />
              )}
            </Box>
            <IconButton onClick={() => setCommentsOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </Box>

          {/* Comments List */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {loadingComments ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : comments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ChatCircle size={48} color="#ccc" />
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  No comments yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Be the first to share feedback!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    pinIndex={pinComments.findIndex((p) => p.id === comment.id) + 1}
                    formatTime={formatTime}
                    getInitials={getInitials}
                    onReply={() => setReplyingTo(comment.id)}
                    onToggleResolved={() => handleToggleResolved(comment)}
                    onMenuOpen={(e) => {
                      setMenuAnchorEl(e.currentTarget);
                      setSelectedComment(comment);
                    }}
                    replyingTo={replyingTo}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    onSubmitReply={() => handleSubmitReply(comment.id)}
                    onCancelReply={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    submittingComment={submittingComment}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* New Comment Input */}
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <TextField
              multiline
              rows={2}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 1.5 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {userInfo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: 'primary.main' }}>
                    {getInitials(userInfo.name)}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {userInfo.name}
                  </Typography>
                </Box>
              ) : (
                <Button
                  size="small"
                  variant="text"
                  startIcon={<User size={16} />}
                  onClick={() => {
                    setTempUserInfo({ name: '', email: '' });
                    setUserInfoDialogOpen(true);
                  }}
                >
                  Set your name
                </Button>
              )}
              <Button
                variant="contained"
                size="small"
                disabled={!newComment.trim() || submittingComment}
                onClick={handleSubmitComment}
              >
                {submittingComment ? 'Sending...' : 'Send'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Comment Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          setMenuAnchorEl(null);
          setSelectedComment(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedComment) handleToggleResolved(selectedComment);
            setMenuAnchorEl(null);
          }}
        >
          {selectedComment?.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedComment) handleDeleteComment(selectedComment);
          }}
          sx={{ color: 'error.main' }}
        >
          Delete comment
        </MenuItem>
      </Menu>

      {/* User Info Dialog */}
      <Dialog
        open={userInfoDialogOpen}
        onClose={() => {
          setUserInfoDialogOpen(false);
          setPendingAction(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {userInfo ? 'Update your info' : 'Enter your info to comment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={tempUserInfo.name}
              onChange={(e) => setTempUserInfo((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              autoFocus
            />
            <TextField
              label="Email"
              type="email"
              value={tempUserInfo.email}
              onChange={(e) => setTempUserInfo((prev) => ({ ...prev, email: e.target.value }))}
              fullWidth
              helperText="Your email won't be shared publicly"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            onClick={() => {
              setUserInfoDialogOpen(false);
              setPendingAction(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUserInfoSubmit}
            disabled={!tempUserInfo.name.trim() || !tempUserInfo.email.trim()}
          >
            {userInfo ? 'Update' : 'Continue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Comment Item Component
interface CommentItemProps {
  comment: CommentWithReplies;
  pinIndex: number;
  formatTime: (date: string) => string;
  getInitials: (name: string) => string;
  onReply: () => void;
  onToggleResolved: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
  submittingComment: boolean;
}

function CommentItem({
  comment,
  pinIndex,
  formatTime,
  getInitials,
  onReply,
  onToggleResolved,
  onMenuOpen,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  onCancelReply,
  submittingComment,
}: CommentItemProps) {
  const isPin = comment.position_x !== null && comment.position_y !== null;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: comment.resolved ? 'rgba(46, 125, 50, 0.05)' : 'rgba(0,0,0,0.02)',
        border: '1px solid',
        borderColor: comment.resolved ? 'success.light' : 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.main' }}>
          {getInitials(comment.user_name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {comment.user_name}
            </Typography>
            {isPin && pinIndex > 0 && (
              <Chip
                size="small"
                icon={<PushPin size={12} />}
                label={`Pin ${pinIndex}`}
                sx={{ height: 20, fontSize: 10 }}
              />
            )}
            {comment.resolved && (
              <CheckCircle size={14} color="#2e7d32" weight="fill" />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {formatTime(comment.created_at)}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 1, wordBreak: 'break-word' }}>
            {comment.content}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={onReply}>
              <ArrowBendUpLeft size={14} />
            </IconButton>
            <IconButton size="small" onClick={onToggleResolved}>
              <Check size={14} />
            </IconButton>
            <IconButton size="small" onClick={onMenuOpen}>
              <DotsThree size={14} />
            </IconButton>
          </Box>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <Box sx={{ mt: 1.5 }}>
              <TextField
                autoFocus
                multiline
                rows={2}
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button size="small" variant="text" onClick={onCancelReply}>
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!replyContent.trim() || submittingComment}
                  onClick={onSubmitReply}
                >
                  Reply
                </Button>
              </Box>
            </Box>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 1.5, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
              {comment.replies.map((reply) => (
                <Box key={reply.id} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: 8, bgcolor: 'grey.500' }}>
                      {getInitials(reply.user_name)}
                    </Avatar>
                    <Typography variant="caption" fontWeight={600}>
                      {reply.user_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(reply.created_at)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 3.5 }}>
                    {reply.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
