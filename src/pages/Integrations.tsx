import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useThemeStore } from '@/store/themeStore';

// Brand logos as SVG components
const BrandLogos: Record<string, (props: { size?: number }) => React.ReactElement> = {
  figma: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" fill="#F24E1E"/>
      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" fill="#FF7262"/>
      <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" fill="#1ABCFE"/>
      <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" fill="#0ACF83"/>
      <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" fill="#A259FF"/>
    </svg>
  ),
  'adobe-xd': ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF61F6">
      <path d="M4.25 2A2.25 2.25 0 0 0 2 4.25v15.5A2.25 2.25 0 0 0 4.25 22h15.5A2.25 2.25 0 0 0 22 19.75V4.25A2.25 2.25 0 0 0 19.75 2H4.25zm3.84 5.25h1.89l1.63 3.56 1.72-3.56h1.8l-2.62 4.75 2.75 4.75h-1.91l-1.79-3.72-1.84 3.72H7.84l2.72-4.75-2.47-4.75zm9.04 0h1.62v9.5h-1.62v-.95c-.47.74-1.22 1.14-2.1 1.14-1.75 0-2.97-1.41-2.97-3.35 0-1.93 1.22-3.34 2.97-3.34.88 0 1.63.4 2.1 1.13v-.93zm-1.84 7.03c1.04 0 1.84-.86 1.84-2.03 0-1.18-.8-2.03-1.84-2.03s-1.84.85-1.84 2.03c0 1.17.8 2.03 1.84 2.03z"/>
    </svg>
  ),
  github: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  ),
  gitlab: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FC6D26">
      <path d="m23.6 9.59-3.75-11.55c-.18-.53-.71-.88-1.26-.88-.12 0-.24.02-.36.05-.48.15-.8.57-.87 1.07l-2.54 7.83H9.17L6.64 0.28c-.07-.5-.39-.92-.87-1.07a1.27 1.27 0 0 0-1.62.83L.39 9.59c-.18.55.03 1.15.52 1.47l10.84 7.87a.5.5 0 0 0 .5 0l10.83-7.87c.49-.32.7-.92.52-1.47z"/>
    </svg>
  ),
  vercel: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 22.525H0l12-21.05 12 21.05z"/>
    </svg>
  ),
  linear: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#5E6AD2">
      <path d="M3.085 13.16l7.723 7.723c-4.367-.432-7.812-3.878-8.243-8.244l.52.521zm.94-1.322l9.137 9.137A9.007 9.007 0 0 0 21 12a9.007 9.007 0 0 0-8.975-9l9.137 9.138A9.03 9.03 0 0 0 12 3a9.03 9.03 0 0 0-9.138 9.138l9.138-9.137A9.007 9.007 0 0 0 3 12a9.007 9.007 0 0 0 1.025 4.838z"/>
    </svg>
  ),
  jira: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0052CC">
      <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84H11.53zM6.77 6.8a4.36 4.36 0 0 0 4.34 4.38h1.8v1.7a4.36 4.36 0 0 0 4.34 4.38V7.65a.84.84 0 0 0-.85-.85H6.77zM2 11.6c0 2.4 1.95 4.35 4.35 4.35h1.78v1.7c.01 2.39 1.95 4.34 4.35 4.35v-9.56a.84.84 0 0 0-.84-.84H2z"/>
    </svg>
  ),
  monday: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF3D57">
      <path d="M4.25 17.25a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5zm7.75 0a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5zm7.75 0a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5z"/>
    </svg>
  ),
  storybook: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF4785">
      <path d="M16.71.243l-.12 2.71a.18.18 0 0 0 .29.15l1.06-.8.9.7a.18.18 0 0 0 .28-.14L19 0l1.86-.07a1.26 1.26 0 0 1 1.31 1.25l-.07 19.61a1.25 1.25 0 0 1-1.32 1.24L5.15 21.6a1.26 1.26 0 0 1-1.18-1.28l.5-18.48c.05-.67.6-1.18 1.27-1.21L16.71.243zm-4.1 8.2c0 .38 2.64.2 3 0 0-2.66-1.43-4.07-4.05-4.07-2.6 0-4.1 1.42-4.1 3.56 0 3.69 4.96 3.76 4.96 5.78 0 .58-.27.91-.9.91-.81 0-1.14-.42-1.1-1.87 0-.3-3.06-.4-3.18 0-.27 3.17 1.75 4.09 4.32 4.09 2.48 0 4.4-1.32 4.4-3.71 0-3.95-5.04-3.89-5.04-5.83 0-.8.55-.89.98-.89.46 0 1.03.1.71 2.03z"/>
    </svg>
  ),
  openai: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  ),
  anthropic: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#D97706">
      <path d="M13.827 3.52h3.603L24 20.48h-3.603l-6.57-16.96zm-7.257 0h3.767L16.907 20.48h-3.674L9.895 12.67l-3.338 7.81H2.893l6.677-16.96z"/>
    </svg>
  ),
};

// Fallback component for integrations without custom logos
const FallbackLogo: React.FC<{ icon: string; size?: number; color?: string }> = ({ icon, size = 20, color }) => (
  <Typography sx={{ fontSize: size * 0.7, fontWeight: 700, color }}>{icon}</Typography>
);

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  connected: boolean;
  popular?: boolean;
}

const integrations: Integration[] = [
  // Design Tools
  { id: 'figma', name: 'Figma', description: 'Import designs and sync components', category: 'Design Tools', icon: 'F', connected: true, popular: true },
  { id: 'adobe-xd', name: 'Adobe XD', description: 'Import XD files and artboards', category: 'Design Tools', icon: 'Xd', connected: false },

  // AI & Code Gen
  { id: 'lovable', name: 'Lovable', description: 'Generate production-ready code', category: 'AI & Code Gen', icon: 'L', connected: false, popular: true },
  { id: 'cursor', name: 'Cursor', description: 'AI-powered code editor integration', category: 'AI & Code Gen', icon: 'C', connected: true },
  { id: 'claude-code', name: 'Claude Code', description: 'AI coding assistant', category: 'AI & Code Gen', icon: 'CC', connected: true },
  { id: 'codex', name: 'OpenAI Codex', description: 'AI code generation', category: 'AI & Code Gen', icon: 'O', connected: false },
  { id: 'base44', name: 'Base44', description: 'Low-code development platform', category: 'AI & Code Gen', icon: 'B', connected: false },
  { id: 'v0', name: 'v0 by Vercel', description: 'AI UI generation', category: 'AI & Code Gen', icon: 'V', connected: false, popular: true },

  // Deployment
  { id: 'vercel', name: 'Vercel', description: 'Deploy prototypes to production', category: 'Deployment', icon: 'V', connected: true, popular: true },

  // Project Management
  { id: 'linear', name: 'Linear', description: 'Sync tasks and issues', category: 'Project Management', icon: 'Li', connected: false, popular: true },
  { id: 'jira', name: 'Jira', description: 'Connect to Jira projects', category: 'Project Management', icon: 'J', connected: false },
  { id: 'monday', name: 'Monday.com', description: 'Integrate with Monday boards', category: 'Project Management', icon: 'M', connected: false },

  // Dev Tools
  { id: 'github', name: 'GitHub', description: 'Push code and create PRs', category: 'Dev Tools', icon: 'GH', connected: true, popular: true },
  { id: 'gitlab', name: 'GitLab', description: 'Connect to GitLab repositories', category: 'Dev Tools', icon: 'GL', connected: false },
  { id: 'storybook', name: 'Storybook', description: 'Export components to Storybook', category: 'Dev Tools', icon: 'S', connected: false },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Design Tools': <DesignServicesOutlinedIcon />,
  'AI & Code Gen': <SmartToyOutlinedIcon />,
  'Deployment': <CloudUploadOutlinedIcon />,
  'Project Management': <AssignmentOutlinedIcon />,
  'Dev Tools': <CodeOutlinedIcon />,
};

// Category colors - will be dynamically set based on theme
const getCategoryColors = (primary: string, textSecondary: string): Record<string, string> => ({
  'Design Tools': primary,
  'AI & Code Gen': '#4D7C0F', // Olive (success tone)
  'Deployment': '#1E40AF', // Slate Blue (info tone)
  'Project Management': '#92400E', // Amber (warning tone)
  'Dev Tools': textSecondary,
});

export function Integrations() {
  const { showSuccess } = useSnackbar();
  const { config, mode } = useThemeStore();
  const [localIntegrations, setLocalIntegrations] = useState(integrations);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState('');

  const categories = [...new Set(integrations.map((i) => i.category))];
  const categoryColors = getCategoryColors(config.colors.primary, config.colors.textSecondary);

  const handleToggleConnection = (integration: Integration) => {
    if (integration.connected) {
      // Disconnect
      setLocalIntegrations((prev) =>
        prev.map((i) => (i.id === integration.id ? { ...i, connected: false } : i))
      );
      showSuccess(`Disconnected from ${integration.name}`);
    } else {
      // Open connect dialog
      setSelectedIntegration(integration);
      setConnectDialogOpen(true);
    }
  };

  const handleConnect = () => {
    if (!selectedIntegration) return;

    // Simulate connection
    setLocalIntegrations((prev) =>
      prev.map((i) => (i.id === selectedIntegration.id ? { ...i, connected: true } : i))
    );
    showSuccess(`Connected to ${selectedIntegration.name}`);
    setConnectDialogOpen(false);
    setSelectedIntegration(null);
    setApiKey('');
  };

  const connectedCount = localIntegrations.filter((i) => i.connected).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: config.fonts.display,
            fontSize: '2.25rem',
            fontWeight: mode === 'craftsman' ? 400 : 700,
            color: config.colors.textPrimary,
            mb: 1,
          }}
        >
          Integrations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect Voxel with your favorite tools · {connectedCount} connected
        </Typography>
      </Box>

      {/* Categories */}
      {categories.map((category) => {
        const categoryIntegrations = localIntegrations.filter((i) => i.category === category);
        const color = categoryColors[category] || config.colors.primary;

        return (
          <Box key={category} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ color }}>{categoryIcons[category]}</Box>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: config.fonts.display,
                  fontSize: '1.25rem',
                  fontWeight: 400,
                }}
              >
                {category}
              </Typography>
              <Chip
                label={`${categoryIntegrations.filter((i) => i.connected).length}/${categoryIntegrations.length}`}
                size="small"
                variant="outlined"
                sx={{ borderColor: config.colors.border }}
              />
            </Box>

            <Grid container spacing={2}>
              {categoryIntegrations.map((integration) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={integration.id}>
                  <Card
                    sx={{
                      height: 140,
                      display: 'flex',
                      flexDirection: 'column',
                      border: integration.connected ? `2px solid ${config.colors.success}` : `1px solid ${config.colors.border}`,
                    }}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {/* Icon box with brand logo */}
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              backgroundColor: config.colors.bgSecondary,
                              color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {BrandLogos[integration.id] ? (
                              BrandLogos[integration.id]({ size: 20 })
                            ) : (
                              <FallbackLogo icon={integration.icon} size={20} color={color} />
                            )}
                          </Box>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                            {integration.name}
                          </Typography>
                        </Box>
                        {integration.connected && (
                          <CheckCircleOutlinedIcon sx={{ color: config.colors.success, fontSize: 18 }} />
                        )}
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          flex: 1,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {integration.description}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: integration.connected ? config.colors.success : config.colors.textSecondary }}
                        >
                          {integration.connected ? 'Connected' : 'Not connected'}
                        </Typography>
                        <Switch
                          checked={integration.connected}
                          onChange={() => handleToggleConnection(integration)}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      {/* Connect Dialog */}
      <Dialog open={connectDialogOpen} onClose={() => setConnectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: config.fonts.display, fontWeight: 400 }}>
          Connect to {selectedIntegration?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your API key or authenticate to connect Voxel with {selectedIntegration?.name}.
          </Typography>
          <TextField
            fullWidth
            label="API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConnect}>
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
