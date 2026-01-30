/**
 * Share Page - Public view for shared prototypes
 * No authentication required
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Card, Chip } from '@/components/ui';
import { Sparkle, Warning } from '@phosphor-icons/react';
import { getShareData, recordShareView, type ShareData } from '@/services/sharingService';

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);

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

        // Record the view for analytics
        await recordShareView(data.share.id, data.variant.index);
      } catch (err) {
        console.error('Error loading share:', err);
        setError('Failed to load shared prototype');
      } finally {
        setLoading(false);
      }
    }

    loadShare();
  }, [token]);

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
      <Box sx={{ flex: 1, position: 'relative' }}>
        {variant.html_url ? (
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
    </Box>
  );
}
