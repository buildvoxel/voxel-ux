import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import InboxIcon from '@mui/icons-material/Inbox';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title = 'No data',
  description = 'There is no data to display.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      {icon || <InboxIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />}
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1, maxWidth: 400 }}>
          {description}
        </Typography>
      )}
      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          sx={{ mt: 3 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
