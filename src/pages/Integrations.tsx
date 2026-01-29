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
import Fade from '@mui/material/Fade';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import { useSnackbar } from '@/components/SnackbarProvider';
import { PageHeader } from '@/components/PageHeader';
import { useThemeStore } from '@/store/themeStore';

// Import integration logos from assets
import figmaLogo from '@/assets/Integration logos/figma-color.svg';
import adobeXdLogo from '@/assets/Integration logos/Adobe_XD_CC_icon.png';
import githubLogo from '@/assets/Integration logos/GitHub_Invertocat_Black.png';
import gitlabLogo from '@/assets/Integration logos/gitlab-logo-500-rgb.png';
import vercelLogo from '@/assets/Integration logos/Vercel_logo_2025.svg';
import linearLogo from '@/assets/Integration logos/logo-dark.png';
import jiraLogo from '@/assets/Integration logos/Jira_attribution_light.png';
import mondayLogo from '@/assets/Integration logos/Logo-monday.com-2.png';
import storybookLogo from '@/assets/Integration logos/logo-storybook-default.png';
import lovableLogo from '@/assets/Integration logos/Lovable_Logo_2025_icon-s1280.png';
import cursorLogo from '@/assets/Integration logos/cursor-ai.png';
import claudeCodeLogo from '@/assets/Integration logos/claude-code-ai-logo.jpg';
import codexLogo from '@/assets/Integration logos/codex logo.webp';
import base44Logo from '@/assets/Integration logos/base44.png';
import v0Logo from '@/assets/Integration logos/v0-logo-png_seeklogo-605781.png';

// Map integration IDs to their logo images
const integrationLogos: Record<string, string> = {
  figma: figmaLogo,
  'adobe-xd': adobeXdLogo,
  github: githubLogo,
  gitlab: gitlabLogo,
  vercel: vercelLogo,
  linear: linearLogo,
  jira: jiraLogo,
  monday: mondayLogo,
  storybook: storybookLogo,
  lovable: lovableLogo,
  cursor: cursorLogo,
  'claude-code': claudeCodeLogo,
  codex: codexLogo,
  base44: base44Logo,
  v0: v0Logo,
};

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  popular?: boolean;
}

const integrations: Integration[] = [
  // Design Tools
  { id: 'figma', name: 'Figma', description: 'Import designs and sync components', category: 'Design Tools', connected: true, popular: true },
  { id: 'adobe-xd', name: 'Adobe XD', description: 'Import XD files and artboards', category: 'Design Tools', connected: false },

  // AI & Code Gen
  { id: 'lovable', name: 'Lovable', description: 'Generate production-ready code', category: 'AI & Code Gen', connected: false, popular: true },
  { id: 'cursor', name: 'Cursor', description: 'AI-powered code editor integration', category: 'AI & Code Gen', connected: true },
  { id: 'claude-code', name: 'Claude Code', description: 'AI coding assistant', category: 'AI & Code Gen', connected: true },
  { id: 'codex', name: 'OpenAI Codex', description: 'AI code generation', category: 'AI & Code Gen', connected: false },
  { id: 'base44', name: 'Base44', description: 'Low-code development platform', category: 'AI & Code Gen', connected: false },
  { id: 'v0', name: 'v0 by Vercel', description: 'AI UI generation', category: 'AI & Code Gen', connected: false, popular: true },

  // Deployment
  { id: 'vercel', name: 'Vercel', description: 'Deploy prototypes to production', category: 'Deployment', connected: true, popular: true },

  // Project Management
  { id: 'linear', name: 'Linear', description: 'Sync tasks and issues', category: 'Project Management', connected: false, popular: true },
  { id: 'jira', name: 'Jira', description: 'Connect to Jira projects', category: 'Project Management', connected: false },
  { id: 'monday', name: 'Monday.com', description: 'Integrate with Monday boards', category: 'Project Management', connected: false },

  // Dev Tools
  { id: 'github', name: 'GitHub', description: 'Push code and create PRs', category: 'Dev Tools', connected: true, popular: true },
  { id: 'gitlab', name: 'GitLab', description: 'Connect to GitLab repositories', category: 'Dev Tools', connected: false },
  { id: 'storybook', name: 'Storybook', description: 'Export components to Storybook', category: 'Dev Tools', connected: false },
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
      <PageHeader
        title="Integrations"
        subtitle={`Connect Voxel with your favorite tools · ${connectedCount} connected`}
        mb={4}
      />

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
              {categoryIntegrations.map((integration, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={integration.id}
                  sx={{
                    animation: 'fadeInUp 0.4s ease forwards',
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translateY(20px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Card
                    sx={{
                      height: 140,
                      display: 'flex',
                      flexDirection: 'column',
                      border: integration.connected ? `2px solid ${config.colors.success}` : `1px solid ${config.colors.border}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {/* Logo image */}
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              backgroundColor: config.colors.bgSecondary,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              overflow: 'hidden',
                              p: 0.5,
                            }}
                          >
                            {integrationLogos[integration.id] ? (
                              <img
                                src={integrationLogos[integration.id]}
                                alt={`${integration.name} logo`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            ) : (
                              <Typography sx={{ fontSize: 14, fontWeight: 700, color }}>{integration.name.charAt(0)}</Typography>
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
      <Dialog
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: config.fonts.display, fontWeight: mode === 'craftsman' ? 400 : 600 }}>
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
