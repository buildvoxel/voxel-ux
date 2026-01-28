import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Key,
  Trash,
  Plus,
  CheckCircle,
  ShieldCheck,
  Robot,
  User,
  Users,
} from '@phosphor-icons/react';
import { useSnackbar } from '@/components/SnackbarProvider';
import { useThemeStore } from '@/store/themeStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components';
import {
  getApiKeys,
  saveApiKey,
  deleteApiKey,
  setActiveProvider,
  validateApiKeyFormat,
  PROVIDER_INFO,
  type ApiKeyConfig,
  type LLMProvider,
} from '@/services/apiKeysService';
import { useAuthStore } from '@/store/authStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function ApiKeysTab() {
  const { showSuccess, showError } = useSnackbar();
  const { config } = useThemeStore();
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<LLMProvider | null>(null);

  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');

  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const keys = await getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      showError('Failed to load API keys');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const openModal = () => {
    setSelectedProvider('anthropic');
    setApiKey('');
    setCustomModel(PROVIDER_INFO['anthropic'].defaultModel);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setApiKey('');
    setCustomModel('');
  };

  const handleAddKey = async () => {
    const validation = validateApiKeyFormat(selectedProvider, apiKey);
    if (!validation.valid) {
      showError(validation.error || 'Invalid API key format');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveApiKey({
        provider: selectedProvider,
        apiKey,
        model: customModel || PROVIDER_INFO[selectedProvider].defaultModel,
      });
      showSuccess(`${PROVIDER_INFO[selectedProvider].name} API key saved securely`);
      closeModal();
      fetchApiKeys();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    try {
      await deleteApiKey(keyToDelete);
      showSuccess('API key deleted');
      fetchApiKeys();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete API key');
    } finally {
      setDeleteConfirmOpen(false);
      setKeyToDelete(null);
    }
  };

  const handleSetActive = async (provider: LLMProvider) => {
    try {
      await setActiveProvider(provider);
      showSuccess(`${PROVIDER_INFO[provider].name} set as active provider`);
      fetchApiKeys();
    } catch (error) {
      showError('Failed to set active provider');
    }
  };

  const handleProviderChange = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    setCustomModel(PROVIDER_INFO[provider].defaultModel);
  };

  const providerInfo = PROVIDER_INFO[selectedProvider];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          LLM API Keys
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure API keys for AI-powered prototype generation. Keys are encrypted and stored securely.
        </Typography>
      </Box>

      <Alert severity="info" icon={<ShieldCheck size={20} />} sx={{ mb: 3 }}>
        Your API keys are encrypted at rest and never exposed in the application. Only server-side functions can access the decrypted keys.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            color: config.colors.textSecondary,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          Configured Providers
        </Typography>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={openModal} size="small">
          Add Provider
        </Button>
      </Box>
      <TableContainer component={Card} sx={{ mb: 3, border: 'none' }}>
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : apiKeys.length === 0 ? (
          <EmptyState
            icon={<Key size={48} color={config.colors.textSecondary} />}
            title="No API keys configured"
            description="Add your first API key to enable AI-powered features"
            action={{ label: 'Add Your First Key', onClick: openModal }}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Provider</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Added</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Robot size={18} color={config.colors.textSecondary} />
                      {PROVIDER_INFO[key.provider].name}
                      {key.isActive && <Chip label="Active" size="small" color="success" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={key.model || PROVIDER_INFO[key.provider].defaultModel} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircle size={14} color={config.colors.success} weight="fill" />
                      <Typography variant="body2" sx={{ color: config.colors.success }}>
                        Connected
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    {!key.isActive && (
                      <Button size="small" onClick={() => handleSetActive(key.provider)}>
                        Set Active
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setKeyToDelete(key.provider);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Provider Info Cards */}
      <Typography
        variant="overline"
        sx={{
          color: config.colors.textSecondary,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          display: 'block',
          mb: 2,
        }}
      >
        Supported Providers
      </Typography>
      <Grid container spacing={2}>
        {(['anthropic', 'openai', 'google'] as LLMProvider[]).map((provider) => {
          const info = PROVIDER_INFO[provider];
          const urls: Record<LLMProvider, string> = {
            anthropic: 'https://console.anthropic.com/settings/keys',
            openai: 'https://platform.openai.com/api-keys',
            google: 'https://aistudio.google.com/app/apikey',
          };
          const hasKey = apiKeys.some((k) => k.provider === provider);

          return (
            <Grid item xs={12} md={4} key={provider}>
              <Card sx={{ height: '100%', border: hasKey ? '2px solid' : undefined, borderColor: 'success.main' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography fontWeight={600}>{info.name}</Typography>
                    {hasKey && <Chip label="Configured" size="small" color="success" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                    {info.description}
                  </Typography>
                  <Box>
                    <Button
                      size="small"
                      onClick={() => window.open(urls[provider], '_blank')}
                    >
                      Get API Key
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add Provider Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Add API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={selectedProvider}
                label="Provider"
                onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
              >
                <MenuItem value="anthropic">Anthropic (Claude)</MenuItem>
                <MenuItem value="openai">OpenAI (GPT)</MenuItem>
                <MenuItem value="google">Google AI (Gemini)</MenuItem>
              </Select>
            </FormControl>

            <Alert severity="info">
              {providerInfo.description}
            </Alert>

            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`${providerInfo.keyPrefix}...`}
              helperText={`Key should start with "${providerInfo.keyPrefix}"`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Key size={18} />
                  </InputAdornment>
                ),
              }}
            />

            <Autocomplete
              freeSolo
              options={providerInfo.models}
              value={customModel}
              onInputChange={(_, value) => setCustomModel(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Default Model"
                  helperText="Select or enter a custom model name"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddKey}
            disabled={isSubmitting || !apiKey}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <ShieldCheck size={16} />}
          >
            Save Securely
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteKey}
        title="Delete API Key"
        content="Are you sure you want to delete this API key? You'll need to add a new key to use this provider again."
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
}

function AccountTab() {
  const { user } = useAuthStore();
  const { showSuccess } = useSnackbar();
  const { config } = useThemeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    companyName: '',
    jobTitle: '',
  });

  const subscriptionPlans = [
    { id: 'free', name: 'Free', features: '3 projects, 5 variants/project' },
    { id: 'pro', name: 'Pro', features: 'Unlimited projects, 20 variants/project, Priority support' },
    { id: 'enterprise', name: 'Enterprise', features: 'Unlimited everything, Custom integrations, SSO' },
  ];

  const currentPlan = subscriptionPlans[0]; // Mock - Free plan

  const handleSave = () => {
    showSuccess('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Account Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>Profile Information</Typography>
                {!isEditing ? (
                  <Button variant="outlined" size="small" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button variant="contained" size="small" onClick={handleSave}>Save</Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                {/* Avatar */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: config.colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 28,
                      fontWeight: 600,
                    }}
                  >
                    {(formData.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </Box>
                  {isEditing && (
                    <Button size="small" variant="text">
                      Change Photo
                    </Button>
                  )}
                </Box>

                {/* Form Fields */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {isEditing ? (
                    <>
                      <TextField
                        fullWidth
                        label="Full Name"
                        size="small"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        size="small"
                        value={formData.email}
                        disabled
                        helperText="Email cannot be changed"
                      />
                      <TextField
                        fullWidth
                        label="Company Name"
                        size="small"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Job Title"
                        size="small"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      />
                    </>
                  ) : (
                    <>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Full Name</Typography>
                        <Typography fontWeight={500}>{formData.name || 'Not set'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography fontWeight={500}>{user?.email}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Company</Typography>
                        <Typography fontWeight={500}>{formData.companyName || 'Not set'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Job Title</Typography>
                        <Typography fontWeight={500}>{formData.jobTitle || 'Not set'}</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={user?.role?.toUpperCase() || 'USER'}
                      color={user?.role === 'admin' ? 'warning' : 'primary'}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Member Since</Typography>
                  <Typography>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Subscription</Typography>

              <Box sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: `${config.colors.primary}10`,
                border: `1px solid ${config.colors.primary}`,
                mb: 2
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>{currentPlan.name}</Typography>
                  <Chip label="Current" size="small" color="primary" />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {currentPlan.features}
                </Typography>
              </Box>

              <Button variant="outlined" fullWidth>
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function UserManagementTab() {
  const { isAdmin } = useAuthStore();
  const { config } = useThemeStore();
  const { showSuccess } = useSnackbar();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'admin'>('user');
  const [inviteTeam, setInviteTeam] = useState('');
  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#764ba2');

  const teamColors = ['#764ba2', '#667eea', '#52c41a', '#faad14', '#f5222d', '#13c2c2', '#722ed1', '#eb2f96'];

  if (!isAdmin()) {
    return (
      <Alert severity="warning">
        User management is only available to administrators.
      </Alert>
    );
  }

  // Mock users data with usage stats
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', team: 'Design', createdAt: '2024-01-01', projects: 12, variants: 48, lastActive: '2025-01-28' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', team: 'Product', createdAt: '2024-01-15', projects: 8, variants: 24, lastActive: '2025-01-27' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'user', team: 'Design', createdAt: '2024-02-01', projects: 5, variants: 15, lastActive: '2025-01-26' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'user', team: 'Engineering', createdAt: '2024-02-15', projects: 3, variants: 9, lastActive: '2025-01-25' },
  ];

  // Mock teams data - using state for dynamic updates
  const [teams, setTeams] = useState([
    { id: '1', name: 'Design', members: 2, color: '#764ba2' },
    { id: '2', name: 'Product', members: 1, color: '#667eea' },
    { id: '3', name: 'Engineering', members: 1, color: '#52c41a' },
  ]);

  const handleInvite = () => {
    showSuccess(`Invitation sent to ${inviteEmail}`);
    setInviteDialogOpen(false);
    setInviteEmail('');
    setInviteRole('user');
    setInviteTeam('');
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam = {
      id: String(teams.length + 1),
      name: newTeamName.trim(),
      members: 0,
      color: newTeamColor,
    };
    setTeams([...teams, newTeam]);
    showSuccess(`Team "${newTeamName}" created`);
    setAddTeamDialogOpen(false);
    setNewTeamName('');
    setNewTeamColor('#764ba2');
  };

  const totalProjects = users.reduce((sum, u) => sum + u.projects, 0);
  const totalVariants = users.reduce((sum, u) => sum + u.variants, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage team members, teams, and permissions.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setInviteDialogOpen(true)}>
          Invite User
        </Button>
      </Box>

      {/* Usage Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">{users.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">{teams.length}</Typography>
              <Typography variant="body2" color="text.secondary">Teams</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">{totalProjects}</Typography>
              <Typography variant="body2" color="text.secondary">Total Projects</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">{totalVariants}</Typography>
              <Typography variant="body2" color="text.secondary">Total Variants</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Teams Section */}
      <Typography
        variant="overline"
        sx={{
          color: config.colors.textSecondary,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          display: 'block',
          mb: 1.5,
        }}
      >
        Teams
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {teams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team.id}>
            <Card sx={{ borderLeft: `4px solid ${team.color}` }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography fontWeight={600}>{team.name}</Typography>
                  <Chip label={`${team.members} members`} size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '1px dashed', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Button startIcon={<Plus size={16} />} size="small" onClick={() => setAddTeamDialogOpen(true)}>Add Team</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Team Dialog */}
      <Dialog open={addTeamDialogOpen} onClose={() => setAddTeamDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Team Name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="e.g., Marketing"
            />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Team Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {teamColors.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setNewTeamColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: newTeamColor === color ? '3px solid' : '2px solid transparent',
                      borderColor: newTeamColor === color ? 'primary.main' : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTeamDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTeam} disabled={!newTeamName.trim()}>
            Create Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Users Table */}
      <Typography
        variant="overline"
        sx={{
          color: config.colors.textSecondary,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          display: 'block',
          mb: 1.5,
        }}
      >
        Team Members
      </Typography>
      <TableContainer component={Card} sx={{ border: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Projects</TableCell>
              <TableCell align="center">Variants</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: config.colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {user.name.charAt(0)}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.team}
                    size="small"
                    sx={{
                      backgroundColor: `${teams.find(t => t.name === user.team)?.color}20`,
                      color: teams.find(t => t.name === user.team)?.color,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    color={user.role === 'admin' ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">{user.projects}</TableCell>
                <TableCell align="center">{user.variants}</TableCell>
                <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <Button size="small">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteRole}
                label="Role"
                onChange={(e) => setInviteRole(e.target.value as 'user' | 'admin')}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Team</InputLabel>
              <Select
                value={inviteTeam}
                label="Team"
                onChange={(e) => setInviteTeam(e.target.value)}
              >
                <MenuItem value="">No Team</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.name}>{team.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite} disabled={!inviteEmail}>
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const { isAdmin } = useAuthStore();

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab icon={<Key size={18} />} label="API Keys" iconPosition="start" />
          <Tab icon={<User size={18} />} label="Account" iconPosition="start" />
          {isAdmin() && <Tab icon={<Users size={18} />} label="Users" iconPosition="start" />}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ApiKeysTab />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AccountTab />
      </TabPanel>
      {isAdmin() && (
        <TabPanel value={tabValue} index={2}>
          <UserManagementTab />
        </TabPanel>
      )}
    </Box>
  );
}
