/**
 * ScreenPreview - Iframe preview with variant tabs for vibe coding
 */

import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import RefreshIcon from '@mui/icons-material/Refresh';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletIcon from '@mui/icons-material/Tablet';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { EmptyState } from '@/components';
import { getVibeVariantColor, getVibeVariantLabel } from '../../store/vibeStore';
import type { VibeVariant } from '../../services/variantCodeService';

export type SelectedTab = 'source' | 1 | 2 | 3 | 4;

interface ScreenPreviewProps {
  sourceHtml: string | null;
  variants: VibeVariant[];
  selectedTab: SelectedTab;
  onTabChange: (tab: SelectedTab) => void;
  selectedVariantIndex?: number | null;
  onExpandPreview?: () => void;
  isGenerating?: boolean;
  currentGeneratingIndex?: number;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_SIZES: Record<ViewportSize, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
};

export const ScreenPreview: React.FC<ScreenPreviewProps> = ({
  sourceHtml,
  variants,
  selectedTab,
  onTabChange,
  selectedVariantIndex,
  onExpandPreview,
  isGenerating = false,
  currentGeneratingIndex,
}) => {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  const variantMap = useMemo(
    () => new Map(variants.map((v) => [v.variant_index, v])),
    [variants]
  );

  const getPreviewContent = (): { html?: string; url?: string; isLoading: boolean } => {
    if (selectedTab === 'source') {
      return { html: sourceHtml || undefined, isLoading: false };
    }
    const variant = variantMap.get(selectedTab);
    if (!variant) {
      return { isLoading: currentGeneratingIndex === selectedTab };
    }
    if (variant.status === 'generating' || variant.status === 'capturing') {
      return { isLoading: true };
    }
    if (variant.status === 'complete' && variant.html_url) {
      return { url: variant.html_url, isLoading: false };
    }
    return { isLoading: false };
  };

  const previewContent = getPreviewContent();

  const handleRefresh = () => setIframeKey((k) => k + 1);

  const getTabStatus = (tab: SelectedTab): 'pending' | 'generating' | 'complete' | 'source' => {
    if (tab === 'source') return 'source';
    const variant = variantMap.get(tab);
    if (!variant) return currentGeneratingIndex === tab ? 'generating' : 'pending';
    if (variant.status === 'generating' || variant.status === 'capturing') return 'generating';
    if (variant.status === 'complete') return 'complete';
    return 'pending';
  };

  const tabs: SelectedTab[] = ['source', 1, 2, 3, 4];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DesktopWindowsIcon />
            <Typography variant="subtitle1" fontWeight={600}>Screen Preview</Typography>
            {selectedTab !== 'source' && (
              <Chip label={getVibeVariantLabel(selectedTab as number)} size="small" sx={{ bgcolor: getVibeVariantColor(selectedTab as number), color: 'white' }} />
            )}
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Desktop"><Button variant={viewport === 'desktop' ? 'contained' : 'outlined'} onClick={() => setViewport('desktop')}><DesktopWindowsIcon fontSize="small" /></Button></Tooltip>
              <Tooltip title="Tablet"><Button variant={viewport === 'tablet' ? 'contained' : 'outlined'} onClick={() => setViewport('tablet')}><TabletIcon fontSize="small" /></Button></Tooltip>
              <Tooltip title="Mobile"><Button variant={viewport === 'mobile' ? 'contained' : 'outlined'} onClick={() => setViewport('mobile')}><PhoneIphoneIcon fontSize="small" /></Button></Tooltip>
            </ButtonGroup>
            <Tooltip title="Refresh"><IconButton size="small" onClick={handleRefresh}><RefreshIcon /></IconButton></Tooltip>
            {onExpandPreview && <Tooltip title="Expand"><IconButton size="small" onClick={onExpandPreview}><OpenInFullIcon /></IconButton></Tooltip>}
          </Box>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden', '&:last-child': { pb: 0 } }}>
        <Box sx={{ flex: 1, bgcolor: 'grey.300', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', p: 2, overflow: 'auto', minHeight: 0 }}>
          <Box sx={{ width: VIEWPORT_SIZES[viewport].width, maxWidth: '100%', height: '100%', bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
            {previewContent.isLoading ? (
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                <CircularProgress />
                <Typography color="text.secondary" sx={{ mt: 2 }}>{selectedTab === 'source' ? 'Loading source...' : `Generating Variant ${selectedTab}...`}</Typography>
              </Box>
            ) : previewContent.url || previewContent.html ? (
              <iframe key={iframeKey} src={previewContent.url} srcDoc={!previewContent.url ? (previewContent.html || sourceHtml || undefined) : undefined} title="Screen preview" sandbox="allow-scripts allow-same-origin" style={{ width: '100%', height: '100%', border: 'none' }} />
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyState title={selectedTab === 'source' ? 'No source HTML' : 'Variant not generated'} />
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 1, px: 2, bgcolor: 'grey.50', display: 'flex', gap: 1, justifyContent: 'center' }}>
          {tabs.map((tab) => {
            const status = getTabStatus(tab);
            const isActive = selectedTab === tab;
            const isSource = tab === 'source';
            const isSelected = !isSource && selectedVariantIndex === tab;
            const isClickable = isSource || status === 'complete' || status === 'generating' || isGenerating;
            return (
              <Button key={tab} variant={isActive ? 'contained' : 'outlined'} size="small" onClick={() => onTabChange(tab)} disabled={!isClickable} sx={{ minWidth: isSource ? 70 : 50, position: 'relative', borderColor: !isSource && !isActive ? getVibeVariantColor(tab as number) : undefined }}>
                {isSource ? 'Source' : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getVibeVariantColor(tab as number) }} />
                    <span>{tab}</span>
                    {status === 'generating' && <CircularProgress size={12} />}
                    {status === 'complete' && <CheckCircleIcon sx={{ fontSize: 12, color: 'success.main' }} />}
                  </Box>
                )}
                {isSelected && <Box sx={{ position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: '50%', bgcolor: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircleIcon sx={{ fontSize: 10, color: 'white' }} /></Box>}
              </Button>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ScreenPreview;
