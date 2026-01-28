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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import { useSnackbar } from '@/components/SnackbarProvider';

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
  'Design Tools': <DesignServicesIcon />,
  'AI & Code Gen': <SmartToyIcon />,
  'Deployment': <CloudUploadIcon />,
  'Project Management': <AssignmentIcon />,
  'Dev Tools': <CodeOutlinedIcon />,
};

const categoryColors: Record<string, string> = {
  'Design Tools': '#ff6b6b',
  'AI & Code Gen': '#4ecdc4',
  'Deployment': '#45b7d1',
  'Project Management': '#96ceb4',
  'Dev Tools': '#dda0dd',
};

export function Integrations() {
  const { showSuccess } = useSnackbar();
  const [localIntegrations, setLocalIntegrations] = useState(integrations);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState('');

  const categories = [...new Set(integrations.map((i) => i.category))];

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
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Integrations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect Voxel with your favorite tools · {connectedCount} connected
        </Typography>
      </Box>

      {/* Categories */}
      {categories.map((category) => {
        const categoryIntegrations = localIntegrations.filter((i) => i.category === category);
        const color = categoryColors[category] || '#764ba2';

        return (
          <Box key={category} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ color }}>{categoryIcons[category]}</Box>
              <Typography variant="h6" fontWeight={600}>
                {category}
              </Typography>
              <Chip
                label={`${categoryIntegrations.filter((i) => i.connected).length}/${categoryIntegrations.length}`}
                size="small"
                variant="outlined"
              />
            </Box>

            <Grid container spacing={2}>
              {categoryIntegrations.map((integration) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={integration.id}>
                  <Card
                    sx={{
                      height: '100%',
                      border: integration.connected ? '2px solid' : '1px solid',
                      borderColor: integration.connected ? 'success.main' : 'divider',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: `${color}20`,
                              color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {integration.icon}
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {integration.name}
                              </Typography>
                              {integration.popular && (
                                <Chip label="Popular" size="small" color="primary" />
                              )}
                            </Box>
                          </Box>
                        </Box>
                        {integration.connected && (
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {integration.description}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color={integration.connected ? 'success.main' : 'text.secondary'}>
                          {integration.connected ? 'Connected' : 'Not connected'}
                        </Typography>
                        <Switch
                          checked={integration.connected}
                          onChange={() => handleToggleConnection(integration)}
                          size="small"
                          color="success"
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
        <DialogTitle>
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
          <Button onClick={() => setConnectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConnect}>
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
