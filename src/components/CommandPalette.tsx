import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import {
  MagnifyingGlass,
  House,
  Flask,
  Folder,
  Brain,
  ChartLine,
  Plug,
  Gear,
  Plus,
  Moon,
  Sun,
  ArrowRight,
  Command,
} from '@phosphor-icons/react';
import { useThemeStore } from '@/store/themeStore';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'navigation' | 'actions' | 'theme';
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { mode, setMode, config } = useThemeStore();

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-home',
      label: 'Go to Home',
      description: 'Dashboard overview',
      icon: <House size={18} />,
      shortcut: 'G H',
      category: 'navigation',
      action: () => { navigate('/'); setOpen(false); },
    },
    {
      id: 'nav-prototypes',
      label: 'Go to Prototypes',
      description: 'Browse all prototypes',
      icon: <Flask size={18} />,
      shortcut: 'G P',
      category: 'navigation',
      action: () => { navigate('/prototypes'); setOpen(false); },
    },
    {
      id: 'nav-screens',
      label: 'Go to Screens',
      description: 'Screen repository',
      icon: <Folder size={18} />,
      shortcut: 'G S',
      category: 'navigation',
      action: () => { navigate('/repository/screens'); setOpen(false); },
    },
    {
      id: 'nav-components',
      label: 'Go to Components',
      description: 'Component library',
      icon: <Folder size={18} />,
      shortcut: 'G C',
      category: 'navigation',
      action: () => { navigate('/repository/components'); setOpen(false); },
    },
    {
      id: 'nav-context',
      label: 'Go to Product Context',
      description: 'Goals, KPIs, and knowledge base',
      icon: <Brain size={18} />,
      category: 'navigation',
      action: () => { navigate('/context'); setOpen(false); },
    },
    {
      id: 'nav-insights',
      label: 'Go to Insights',
      description: 'Analytics and feedback',
      icon: <ChartLine size={18} />,
      category: 'navigation',
      action: () => { navigate('/insights'); setOpen(false); },
    },
    {
      id: 'nav-integrations',
      label: 'Go to Integrations',
      description: 'Connected tools',
      icon: <Plug size={18} />,
      category: 'navigation',
      action: () => { navigate('/integrations'); setOpen(false); },
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      description: 'App preferences',
      icon: <Gear size={18} />,
      category: 'navigation',
      action: () => { navigate('/settings'); setOpen(false); },
    },
    // Actions
    {
      id: 'action-new-prototype',
      label: 'Create New Prototype',
      description: 'Start a new prototype project',
      icon: <Plus size={18} />,
      shortcut: 'N',
      category: 'actions',
      action: () => { navigate('/prototypes'); setOpen(false); },
    },
    // Theme
    {
      id: 'theme-craftsman',
      label: 'Switch to Craftsman Theme',
      description: 'Warm, refined aesthetics',
      icon: <Sun size={18} />,
      category: 'theme',
      action: () => { setMode('craftsman'); setOpen(false); },
    },
    {
      id: 'theme-modern',
      label: 'Switch to Modern Theme',
      description: 'Bold, gradient-rich design',
      icon: <Moon size={18} />,
      category: 'theme',
      action: () => { setMode('modern'); setOpen(false); },
    },
  ], [navigate, setMode]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      actions: [],
      theme: [],
    };
    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const flatList = useMemo(() => filteredCommands, [filteredCommands]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Open with Cmd+K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(true);
      setQuery('');
      setSelectedIndex(0);
    }
  }, []);

  // Dialog keyboard navigation
  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatList[selectedIndex]) {
      e.preventDefault();
      flatList[selectedIndex].action();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    theme: 'Theme',
  };

  let currentIndex = -1;

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      onKeyDown={handleDialogKeyDown}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: config.colors.surface,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          maxHeight: '480px',
        },
      }}
    >
      {/* Search Input */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${config.colors.border}` }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="Type a command or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlass size={20} color={config.colors.textSecondary} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Chip
                  size="small"
                  label="ESC"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    backgroundColor: config.colors.bgSecondary,
                    color: config.colors.textSecondary,
                  }}
                />
              </InputAdornment>
            ),
            sx: {
              fontSize: '1rem',
              fontFamily: config.fonts.body,
            },
          }}
        />
      </Box>

      {/* Results */}
      <Box sx={{ overflow: 'auto', maxHeight: 360 }}>
        {flatList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              No commands found
            </Typography>
          </Box>
        ) : (
          Object.entries(groupedCommands).map(([category, items]) => {
            if (items.length === 0) return null;
            return (
              <Box key={category}>
                <Typography
                  variant="overline"
                  sx={{
                    px: 2,
                    py: 1,
                    display: 'block',
                    color: config.colors.textSecondary,
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  {categoryLabels[category]}
                </Typography>
                {items.map((cmd) => {
                  currentIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  const itemIndex = currentIndex;
                  return (
                    <Box
                      key={cmd.id}
                      onClick={() => cmd.action()}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2,
                        py: 1,
                        mx: 1,
                        mb: 0.5,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: isSelected
                          ? mode === 'modern'
                            ? 'rgba(20, 184, 166, 0.1)'
                            : 'rgba(184, 134, 11, 0.1)'
                          : 'transparent',
                        transition: 'background-color 100ms ease',
                        '&:hover': {
                          backgroundColor: mode === 'modern'
                            ? 'rgba(20, 184, 166, 0.1)'
                            : 'rgba(184, 134, 11, 0.1)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          color: isSelected ? config.colors.primary : config.colors.textSecondary,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {cmd.icon}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: config.colors.textPrimary,
                          }}
                        >
                          {cmd.label}
                        </Typography>
                        {cmd.description && (
                          <Typography
                            variant="caption"
                            sx={{ color: config.colors.textSecondary }}
                          >
                            {cmd.description}
                          </Typography>
                        )}
                      </Box>
                      {cmd.shortcut && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {cmd.shortcut.split(' ').map((key, i) => (
                            <Chip
                              key={i}
                              size="small"
                              label={key}
                              sx={{
                                height: 20,
                                minWidth: 24,
                                fontSize: '0.65rem',
                                backgroundColor: config.colors.bgSecondary,
                                color: config.colors.textSecondary,
                              }}
                            />
                          ))}
                        </Box>
                      )}
                      {isSelected && (
                        <ArrowRight size={16} color={config.colors.primary} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${config.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              size="small"
              label={<Command size={10} />}
              sx={{
                height: 18,
                minWidth: 18,
                fontSize: '0.6rem',
                backgroundColor: config.colors.bgSecondary,
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
            <Chip
              size="small"
              label="K"
              sx={{
                height: 18,
                minWidth: 18,
                fontSize: '0.6rem',
                backgroundColor: config.colors.bgSecondary,
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              to open
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              size="small"
              icon={undefined}
              label="↑↓"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                backgroundColor: config.colors.bgSecondary,
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              navigate
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              size="small"
              label="↵"
              sx={{
                height: 18,
                minWidth: 18,
                fontSize: '0.6rem',
                backgroundColor: config.colors.bgSecondary,
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              select
            </Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
