/**
 * VariantPreviewModal - Full-screen variant preview
 */

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckIcon from '@mui/icons-material/Check';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletIcon from '@mui/icons-material/Tablet';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import { useSnackbar } from '@/components/SnackbarProvider';
import { getVibeVariantColor, getVibeVariantLabel } from '../../store/vibeStore';
import type { VibeVariant } from '../../services/variantCodeService';
import type { VariantPlan } from '../../services/variantPlanService';

interface VariantPreviewModalProps {
  open: boolean;
  onClose: () => void;
  variant: VibeVariant | null;
  plan: VariantPlan | null;
  onSelect?: () => void;
  isSelected?: boolean;
}

type ViewMode = 'preview' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<DeviceMode, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 375,
};

export const VariantPreviewModal: React.FC<VariantPreviewModalProps> = ({
  open,
  onClose,
  variant,
  plan,
  onSelect,
  isSelected = false,
}) => {
  const { showSuccess } = useSnackbar();
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (open && variant?.html_url && viewMode === 'code' && !htmlContent) {
      setIsLoading(true);
      fetch(variant.html_url)
        .then((res) => res.text())
        .then((html) => setHtmlContent(html))
        .catch((err) => console.error('Failed to fetch HTML:', err))
        .finally(() => setIsLoading(false));
    }
  }, [open, variant?.html_url, viewMode, htmlContent]);

  useEffect(() => {
    if (!open) {
      setHtmlContent(null);
      setViewMode('preview');
      setDeviceMode('desktop');
    }
  }, [open]);

  const handleCopyHtml = async () => {
    if (!htmlContent) return;
    await navigator.clipboard.writeText(htmlContent);
    showSuccess('HTML copied to clipboard');
  };

  const handleDownloadHtml = () => {
    if (!htmlContent || !variant) return;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `variant_${variant.variant_index}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('HTML downloaded');
  };

  if (!variant || !plan) return null;

  const color = getVibeVariantColor(plan.variant_index);
  const label = getVibeVariantLabel(plan.variant_index);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isFullscreen}
      PaperProps={{ sx: { width: isFullscreen ? '100%' : 1200, maxWidth: '100%' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={plan.variant_index} size="small" sx={{ bgcolor: color, color: 'white', fontWeight: 600 }} />
          <Typography variant="h6">{label}: {plan.title}</Typography>
        </Box>
        <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: isFullscreen ? 'calc(100vh - 140px)' : 500, bgcolor: viewMode === 'preview' ? 'grey.300' : '#1e1e1e' }}>
        {viewMode === 'preview' && (
          <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', p: 2.5, overflow: 'auto' }}>
            <Box sx={{ width: deviceMode === 'desktop' ? '100%' : DEVICE_WIDTHS[deviceMode], maxWidth: '100%', height: '100%', bgcolor: 'white', boxShadow: 4, borderRadius: 2, overflow: 'hidden' }}>
              {variant.html_url ? (
                <iframe src={variant.html_url} title={`Variant ${plan.variant_index}`} style={{ width: '100%', height: '100%', border: 'none' }} />
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
              )}
            </Box>
          </Box>
        )}
        {viewMode === 'code' && (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {isLoading ? (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : (
              <Box component="pre" sx={{ m: 0, p: 2, color: '#d4d4d4', fontSize: 12, fontFamily: '"Fira Code", monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {htmlContent}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tabs value={viewMode} onChange={(_, v) => setViewMode(v)} sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0 } }}>
            <Tab value="preview" label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><VisibilityOutlinedIcon fontSize="small" /> Preview</Box>} />
            <Tab value="code" label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CodeOutlinedIcon fontSize="small" /> Code</Box>} />
          </Tabs>
          {viewMode === 'preview' && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Desktop"><IconButton size="small" color={deviceMode === 'desktop' ? 'primary' : 'default'} onClick={() => setDeviceMode('desktop')}><DesktopWindowsIcon /></IconButton></Tooltip>
              <Tooltip title="Tablet"><IconButton size="small" color={deviceMode === 'tablet' ? 'primary' : 'default'} onClick={() => setDeviceMode('tablet')}><TabletIcon /></IconButton></Tooltip>
              <Tooltip title="Mobile"><IconButton size="small" color={deviceMode === 'mobile' ? 'primary' : 'default'} onClick={() => setDeviceMode('mobile')}><PhoneIphoneIcon /></IconButton></Tooltip>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {viewMode === 'code' && (
            <>
              <Button startIcon={<ContentCopyOutlinedIcon />} onClick={handleCopyHtml} disabled={!htmlContent}>Copy HTML</Button>
              <Button startIcon={<DownloadIcon />} onClick={handleDownloadHtml} disabled={!htmlContent}>Download</Button>
            </>
          )}
          <Button variant={isSelected ? 'outlined' : 'contained'} startIcon={isSelected ? <CheckIcon /> : undefined} onClick={onSelect}>
            {isSelected ? 'Selected as Winner' : 'Select as Winner'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VariantPreviewModal;
