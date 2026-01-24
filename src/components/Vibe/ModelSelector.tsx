/**
 * ModelSelector - Dropdown to select LLM provider and model for generation
 */

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BoltIcon from '@mui/icons-material/Bolt';
import {
  PROVIDER_INFO,
  getApiKeys,
  getActiveProvider,
  setActiveProvider,
  type LLMProvider,
  type ApiKeyConfig,
} from '../../services/apiKeysService';

interface ModelSelectorProps {
  onChange?: (provider: LLMProvider, model: string) => void;
  size?: 'small' | 'medium';
  showLabel?: boolean;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  onChange,
  size = 'small',
  showLabel = true,
  disabled = false,
}) => {
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load API keys and active provider on mount
  useEffect(() => {
    const loadKeys = async () => {
      try {
        const keys = await getApiKeys();
        setApiKeys(keys);

        const activeProvider = await getActiveProvider();
        if (activeProvider) {
          setSelectedProvider(activeProvider);
          const activeKey = keys.find(k => k.provider === activeProvider);
          setSelectedModel(activeKey?.model || PROVIDER_INFO[activeProvider].defaultModel);
        } else if (keys.length > 0) {
          // Default to first configured provider
          const firstKey = keys[0];
          setSelectedProvider(firstKey.provider);
          setSelectedModel(firstKey.model || PROVIDER_INFO[firstKey.provider].defaultModel);
        }
      } catch (err) {
        console.error('Error loading API keys:', err);
      } finally {
        setLoading(false);
      }
    };

    loadKeys();
  }, []);

  // Get providers that have API keys configured
  const configuredProviders = apiKeys.map(k => k.provider);

  const handleProviderChange = async (provider: LLMProvider) => {
    setSelectedProvider(provider);
    const defaultModel = PROVIDER_INFO[provider].defaultModel;
    const keyConfig = apiKeys.find(k => k.provider === provider);
    const model = keyConfig?.model || defaultModel;
    setSelectedModel(model);

    // Persist the selection
    await setActiveProvider(provider);

    onChange?.(provider, model);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (selectedProvider) {
      onChange?.(selectedProvider, model);
    }
  };

  // Get models for current provider
  const currentModels = selectedProvider
    ? PROVIDER_INFO[selectedProvider].models
    : [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {showLabel && (
          <Typography variant="caption" color="text.secondary">
            Model:
          </Typography>
        )}
        <CircularProgress size={16} />
      </Box>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <Tooltip title="Add an API key in Settings to use AI generation">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showLabel && (
            <Typography variant="caption" color="text.secondary">
              Model:
            </Typography>
          )}
          <Chip
            icon={<SmartToyIcon />}
            label="No API key"
            size="small"
            color="warning"
          />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showLabel && (
        <Tooltip title="Select AI model for generation">
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BoltIcon sx={{ fontSize: 14 }} />
            Model:
          </Typography>
        </Tooltip>
      )}
      <FormControl size={size} sx={{ minWidth: 110 }}>
        <Select
          value={selectedProvider || ''}
          onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
          disabled={disabled}
          displayEmpty
        >
          {Object.entries(PROVIDER_INFO).map(([provider, info]) => {
            const hasKey = configuredProviders.includes(provider as LLMProvider);
            return (
              <MenuItem key={provider} value={provider} disabled={!hasKey}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{info.name}</span>
                  {!hasKey && (
                    <Chip label="No key" size="small" color="warning" sx={{ fontSize: 10, height: 18 }} />
                  )}
                </Box>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <FormControl size={size} sx={{ minWidth: 180 }}>
        <Select
          value={selectedModel || ''}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={disabled || !selectedProvider}
          displayEmpty
        >
          {currentModels.map(model => (
            <MenuItem key={model} value={model}>
              {model}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ModelSelector;
