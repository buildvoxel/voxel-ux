/**
 * PromptInputPanel - Input for user prompt and context selection
 */

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface ProductContext {
  id: string;
  name: string;
  type: string;
}

interface PromptInputPanelProps {
  onSubmit: (prompt: string, contextId?: string) => void;
  isLoading?: boolean;
  productContexts?: ProductContext[];
  disabled?: boolean;
  placeholder?: string;
  defaultPrompt?: string;
}

// Example prompts for inspiration
const EXAMPLE_PROMPTS = [
  'Make the design more modern with a dark theme',
  'Simplify the navigation and improve readability',
  'Add a hero section with a call-to-action button',
  'Make it more vibrant with gradient backgrounds',
  'Optimize for mobile with larger touch targets',
  'Add subtle animations and hover effects',
];

export const PromptInputPanel: React.FC<PromptInputPanelProps> = ({
  onSubmit,
  isLoading = false,
  productContexts = [],
  disabled = false,
  placeholder = 'Describe how you want to transform this design...',
  defaultPrompt = '',
}) => {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [selectedContext, setSelectedContext] = useState<string>('');

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit(prompt.trim(), selectedContext || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  const insertExample = (example: string) => {
    setPrompt(example);
  };

  return (
    <Card>
      <CardHeader
        avatar={<FlashOnIcon />}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>Design Prompt</Typography>
            <Tooltip title="Describe how you want the AI to transform your design. Be specific about colors, layout, components, or overall style.">
              <HelpOutlineIcon sx={{ color: 'text.secondary', fontSize: 18, cursor: 'help' }} />
            </Tooltip>
          </Box>
        }
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Prompt Input */}
          <Box>
            <TextField
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              multiline
              rows={4}
              fullWidth
              disabled={disabled || isLoading}
            />
            <Box sx={{ mt: 0.5, textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Press <kbd style={{ padding: '2px 4px', background: '#f0f0f0', borderRadius: 2 }}>Cmd</kbd> + <kbd style={{ padding: '2px 4px', background: '#f0f0f0', borderRadius: 2 }}>Enter</kbd> to generate
              </Typography>
            </Box>
          </Box>

          {/* Example Prompts */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Need inspiration? Try one of these:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {EXAMPLE_PROMPTS.map((example, i) => (
                <Button
                  key={i}
                  size="small"
                  variant="outlined"
                  onClick={() => insertExample(example)}
                  disabled={disabled || isLoading}
                  sx={{ fontSize: 11, textTransform: 'none' }}
                >
                  {example.length > 30 ? example.slice(0, 30) + '...' : example}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Product Context Selection */}
          {productContexts.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DescriptionIcon sx={{ fontSize: 14 }} />
                Include product context (optional)
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Select product context...</InputLabel>
                <Select
                  value={selectedContext}
                  onChange={(e) => setSelectedContext(e.target.value)}
                  label="Select product context..."
                  disabled={disabled || isLoading}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {productContexts.map((ctx) => (
                    <MenuItem key={ctx.id} value={ctx.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{ctx.name}</span>
                        <Typography variant="caption" color="text.secondary">
                          ({ctx.type})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Submit Button */}
          <Button
            variant="contained"
            startIcon={<FlashOnIcon />}
            onClick={handleSubmit}
            disabled={disabled || !prompt.trim() || isLoading}
            size="large"
            fullWidth
          >
            {isLoading ? 'Generating Plan...' : 'Generate 4 Variants'}
          </Button>

          {/* Info Alert */}
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="body2">
              The AI will create 4 different design concepts based on your prompt.
              You'll review them before any code is generated.
            </Typography>
          </Alert>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PromptInputPanel;
