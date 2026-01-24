/**
 * ChatMessage - Individual chat message component for the vibe coding interface
 */

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'pending' | 'complete' | 'error';
  metadata?: {
    variantIndex?: number;
    stage?: string;
  };
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isPending = message.status === 'pending';
  const isError = message.status === 'error';

  const getIcon = () => {
    if (isPending) return <CircularProgress size={16} />;
    if (isError) return <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />;
    if (isUser) return <PersonIcon sx={{ fontSize: 16 }} />;
    if (isSystem) return <InfoIcon sx={{ fontSize: 16 }} />;
    return <SmartToyIcon sx={{ fontSize: 16 }} />;
  };

  const getBubbleStyles = () => {
    if (isUser) {
      return {
        bgcolor: 'primary.main',
        color: 'white',
        borderRadius: '16px 16px 4px 16px',
      };
    }
    if (isSystem) {
      return {
        bgcolor: 'primary.lighter',
        color: 'primary.dark',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'primary.light',
      };
    }
    if (isError) {
      return {
        bgcolor: 'error.lighter',
        color: 'error.dark',
        borderRadius: '16px 16px 16px 4px',
        border: '1px solid',
        borderColor: 'error.light',
      };
    }
    return {
      bgcolor: 'grey.100',
      color: 'text.primary',
      borderRadius: '16px 16px 16px 4px',
    };
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 1,
        mb: 1.5,
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: isUser ? 'primary.main' : isSystem ? 'primary.lighter' : 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: isUser ? 'white' : 'text.secondary',
        }}
      >
        {getIcon()}
      </Box>

      <Box
        sx={{
          maxWidth: '80%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        <Box
          sx={{
            px: 1.75,
            py: 1.25,
            ...getBubbleStyles(),
          }}
        >
          {isPending && (
            <Box sx={{ mb: 0.5 }}>
              <CircularProgress size={14} />
            </Box>
          )}
          <Typography
            variant="body2"
            sx={{
              color: 'inherit',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: 1.5,
            }}
          >
            {message.content}
          </Typography>
          {message.metadata?.variantIndex && (
            <Chip
              label={`Variant ${message.metadata.variantIndex}`}
              size="small"
              color="primary"
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 0.5,
            pl: isUser ? 0 : 0.5,
            pr: isUser ? 0.5 : 0,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {formatTime(message.timestamp)}
          {message.status === 'complete' && (
            <CheckCircleIcon sx={{ fontSize: 12, color: 'success.main' }} />
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
