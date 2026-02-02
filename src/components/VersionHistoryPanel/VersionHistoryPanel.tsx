import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { EmptyState } from '@/components';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { ScreenVersion } from '@/types';

interface VersionHistoryPanelProps {
  versions: ScreenVersion[];
  currentVersionId?: string;
  currentHtml?: string;
  isLoading?: boolean;
  onPreview: (version: ScreenVersion) => void;
  onRestore: (version: ScreenVersion) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function VersionHistoryPanel({
  versions,
  currentVersionId,
  currentHtml,
  isLoading,
  onPreview,
  onRestore,
}: VersionHistoryPanelProps) {
  const [previewVersion, setPreviewVersion] = useState<ScreenVersion | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [restoreConfirmVersion, setRestoreConfirmVersion] = useState<ScreenVersion | null>(null);

  const handlePreview = (version: ScreenVersion) => {
    setPreviewVersion(version);
    setIsPreviewModalOpen(true);
    onPreview(version);
  };

  const handleClosePreview = () => {
    setIsPreviewModalOpen(false);
    setPreviewVersion(null);
  };

  const handleRestore = (version: ScreenVersion) => {
    onRestore(version);
    setRestoreConfirmVersion(null);
  };

  // Check if a version matches current HTML content
  const isCurrentVersion = (version: ScreenVersion): boolean => {
    if (currentVersionId && version.id === currentVersionId) return true;
    if (currentHtml && version.html === currentHtml) return true;
    return false;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Loading versions...
        </Typography>
      </Box>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState title="No version history yet" />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>Version History</Typography>
        <Chip label={versions.length} size="small" color="primary" />
      </Box>

      {/* Timeline */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {versions.map((version, index) => {
          const isAI = !!version.prompt;
          const isCurrent = isCurrentVersion(version);
          const isLatest = index === 0;
          const isLast = index === versions.length - 1;

          return (
            <Box key={version.id} sx={{ display: 'flex', gap: 2, mb: isLast ? 0 : 2 }}>
              {/* Timeline indicator */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: isAI ? 'secondary.main' : 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  {isAI ? <SmartToyIcon sx={{ fontSize: 16 }} /> : <AccessTimeIcon sx={{ fontSize: 16 }} />}
                </Box>
                {!isLast && (
                  <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', mt: 0.5 }} />
                )}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, pb: isLast ? 0 : 2 }}>
                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                  {isLatest && <Chip label="Latest" size="small" color="success" />}
                  {isCurrent && (
                    <Chip label="Current" size="small" color="primary" icon={<CheckCircleIcon />} />
                  )}
                  {isAI && <Chip label="AI" size="small" color="secondary" />}
                </Box>

                {/* Description */}
                <Box sx={{ mb: 0.5 }}>
                  {version.prompt ? (
                    <Typography
                      variant="body2"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {version.prompt}
                    </Typography>
                  ) : version.description ? (
                    <Typography variant="body2">{version.description}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Manual edit
                    </Typography>
                  )}
                </Box>

                {/* Timestamp */}
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(version.createdAt)}
                </Typography>

                {/* Actions */}
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Preview this version">
                    <Button
                      size="small"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => handlePreview(version)}
                    >
                      Preview
                    </Button>
                  </Tooltip>
                  {!isCurrent && (
                    <Tooltip title="Restore this version">
                      <Button
                        size="small"
                        startIcon={<RestoreIcon />}
                        onClick={() => setRestoreConfirmVersion(version)}
                      >
                        Restore
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        open={!!restoreConfirmVersion}
        title="Restore this version?"
        content="This will replace the current content with this version."
        confirmText="Restore"
        onConfirm={() => restoreConfirmVersion && handleRestore(restoreConfirmVersion)}
        onClose={() => setRestoreConfirmVersion(null)}
      />

      {/* Preview Modal */}
      <Dialog
        open={isPreviewModalOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">Version Preview</Typography>
          {previewVersion?.prompt && <Chip label="AI Generated" size="small" color="secondary" />}
        </DialogTitle>
        <DialogContent>
          {previewVersion && (
            <Box>
              {/* Version info */}
              <Box sx={{ mb: 2 }}>
                {previewVersion.prompt && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" component="span">Prompt: </Typography>
                    <Typography variant="body2" component="span">{previewVersion.prompt}</Typography>
                  </Box>
                )}
                {previewVersion.description && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" component="span">Description: </Typography>
                    <Typography variant="body2" component="span">{previewVersion.description}</Typography>
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(previewVersion.createdAt).toLocaleString()}
                </Typography>
              </Box>

              {/* Preview iframe */}
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  height: 400,
                }}
              >
                <iframe
                  srcDoc={previewVersion.html}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  sandbox="allow-scripts allow-same-origin"
                  title="Version preview"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
          {previewVersion && !isCurrentVersion(previewVersion) && (
            <Button
              variant="contained"
              startIcon={<RestoreIcon />}
              onClick={() => {
                if (previewVersion) {
                  handleRestore(previewVersion);
                  handleClosePreview();
                }
              }}
            >
              Restore
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
