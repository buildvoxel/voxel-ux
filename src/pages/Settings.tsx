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
              <Card sx={{ border: hasKey ? '2px solid' : undefined, borderColor: 'success.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography fontWeight={600}>{info.name}</Typography>
                    {hasKey && <Chip label="Configured" size="small" color="success" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {info.description}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Models: {info.models.slice(0, 3).join(', ')}...
                  </Typography>
                  <Box sx={{ mt: 1 }}>
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

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Account Settings
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography fontWeight={500}>{user?.email}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography fontWeight={500}>{user?.name || 'Not set'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">Role</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={user?.role?.toUpperCase()}
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
    </Box>
  );
}

function UserManagementTab() {
  const { isAdmin } = useAuthStore();
  const { config } = useThemeStore();

  if (!isAdmin()) {
    return (
      <Alert severity="warning">
        User management is only available to administrators.
      </Alert>
    );
  }

  // Mock users data
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', createdAt: '2024-01-01' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: '2024-01-15' },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        User Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage team members and their permissions.
      </Typography>

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
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    color={user.role === 'admin' ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
