/**
 * ChatPanel - Chat-style interface for vibe coding prompts and responses
 */

import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import SendIcon from '@mui/icons-material/Send';
import BoltIcon from '@mui/icons-material/Bolt';
import { ChatMessage, type ChatMessageData } from './ChatMessage';

// Example prompts for quick input
const EXAMPLE_PROMPTS = [
  'Make it more modern with a dark theme',
  'Simplify the navigation',
  'Add a hero section with CTA',
  'Make colors more vibrant',
];

interface ChatPanelProps {
  messages: ChatMessageData[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
  disabled = false,
  placeholder = 'Describe your design changes...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading || disabled) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const hasMessages = messages.length > 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        avatar={<BoltIcon sx={{ color: 'primary.main' }} />}
        title="Vibe Chat"
        sx={{ pb: 0 }}
      />

      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          overflow: 'hidden',
          '&:last-child': { pb: 0 },
        }}
      >
        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            minHeight: 0,
          }}
        >
          {!hasMessages && (
            <Box sx={{ textAlign: 'center', pt: 5 }}>
              <BoltIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">
                Start by describing how you want to transform the design
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                The AI will create 4 different variant concepts based on your prompt
              </Typography>
            </Box>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 1.5,
            bgcolor: 'grey.50',
          }}
        >
          {/* Example prompts - only show when no messages */}
          {!hasMessages && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Try an example:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                {EXAMPLE_PROMPTS.map((prompt, i) => (
                  <Chip
                    key={i}
                    label={prompt.length > 25 ? prompt.slice(0, 25) + '...' : prompt}
                    size="small"
                    variant="outlined"
                    onClick={() => handleExampleClick(prompt)}
                    disabled={disabled || isLoading}
                    sx={{ fontSize: 11 }}
                  />
                ))}
              </Box>
              <Divider sx={{ my: 1 }} />
            </>
          )}

          {/* Input */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              inputRef={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              multiline
              minRows={1}
              maxRows={4}
              fullWidth
              size="small"
              sx={{ flex: 1 }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={disabled || !inputValue.trim() || isLoading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'action.disabledBackground' },
              }}
            >
              {isLoading ? (
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    border: '2px solid currentColor',
                    borderRightColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}
          >
            <Box
              component="kbd"
              sx={{
                px: 0.5,
                py: 0.25,
                bgcolor: 'white',
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                fontSize: 10,
              }}
            >
              ⌘
            </Box>
            {' + '}
            <Box
              component="kbd"
              sx={{
                px: 0.5,
                py: 0.25,
                bgcolor: 'white',
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                fontSize: 10,
              }}
            >
              Enter
            </Box>
            {' to send'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
