import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

interface ThumbnailCardProps {
  title: string;
  subtitle?: string;
  tags?: string[];
  thumbnailContent?: React.ReactNode;
  selected?: boolean;
  selectionMode?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function ThumbnailCard({
  title,
  subtitle,
  tags,
  thumbnailContent,
  selected,
  selectionMode,
  onSelect,
  onClick,
  actions,
}: ThumbnailCardProps) {
  const handleCardClick = () => {
    if (selectionMode && onSelect) {
      onSelect();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick || selectionMode ? 'pointer' : 'default',
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      {/* Thumbnail Area */}
      <Box
        onClick={handleCardClick}
        sx={{
          height: 180,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {thumbnailContent || (
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.5)' }} />
        )}

        {/* Selection checkbox overlay */}
        {selectionMode && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
          >
            <Checkbox
              checked={selected}
              sx={{
                color: 'white',
                '&.Mui-checked': { color: 'white' },
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 1,
              }}
            />
          </Box>
        )}

        {/* Hover overlay with preview icon */}
        {!selectionMode && onClick && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              opacity: 0,
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': { opacity: 1 },
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, py: 1.5 }}>
        <Typography
          variant="subtitle2"
          component="div"
          noWrap
          title={title}
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {tags && tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </CardContent>

      {/* Actions */}
      {actions && !selectionMode && (
        <CardActions sx={{ px: 2, py: 1, justifyContent: 'flex-start' }}>
          {actions}
        </CardActions>
      )}
    </Card>
  );
}
