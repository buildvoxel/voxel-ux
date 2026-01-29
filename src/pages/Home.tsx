import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { Plus, TrendUp, Rocket, Flask, Eye } from '@phosphor-icons/react';
import { Button, Card, CardContent, Chip } from '@/components/ui';
import { StatCard, PageHeader } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

// Mock data
const recentPrototypes = [
  {
    id: '1',
    name: 'E-commerce Checkout Flow',
    status: 'shared',
    views: 234,
    updatedAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'Dashboard Redesign',
    status: 'draft',
    views: 0,
    updatedAt: '1 day ago',
  },
  {
    id: '3',
    name: 'Mobile App Onboarding',
    status: 'deployed',
    views: 567,
    updatedAt: '3 days ago',
  },
];

const recentInsights = [
  {
    id: '1',
    prototypeName: 'E-commerce Checkout Flow',
    metric: 'Conversion Rate',
    value: '+15.3%',
    trend: 'up' as const,
  },
  {
    id: '2',
    prototypeName: 'Dashboard Redesign',
    metric: 'Avg. Time on Page',
    value: '4m 32s',
    trend: 'up' as const,
  },
  {
    id: '3',
    prototypeName: 'Mobile App Onboarding',
    metric: 'Completion Rate',
    value: '78%',
    trend: 'up' as const,
  },
];

const deployedPrototypes = [
  {
    id: '1',
    name: 'Mobile App Onboarding',
    environment: 'Production',
    progress: 100,
    deployedAt: '3 days ago',
  },
  {
    id: '2',
    name: 'Settings Page v2',
    environment: 'Staging',
    progress: 75,
    deployedAt: 'In progress',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'shared':
      return 'primary';
    case 'deployed':
      return 'success';
    default:
      return 'default';
  }
};

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { config, mode } = useThemeStore();

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="Here's what's happening with your prototypes"
        mb={4}
      />

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          sx={{
            animation: 'fadeInUp 0.4s ease forwards',
            animationDelay: '0.05s',
            opacity: 0,
            '@keyframes fadeInUp': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <StatCard
            title="Total Prototypes"
            value={12}
            icon={<Flask size={20} />}
            trend={{ direction: 'up', value: 8 }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          sx={{
            animation: 'fadeInUp 0.4s ease forwards',
            animationDelay: '0.1s',
            opacity: 0,
          }}
        >
          <StatCard
            title="Total Views"
            value="2.4K"
            icon={<Eye size={20} />}
            trend={{ direction: 'up', value: 12.5 }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          sx={{
            animation: 'fadeInUp 0.4s ease forwards',
            animationDelay: '0.15s',
            opacity: 0,
          }}
        >
          <StatCard
            title="Shared"
            value={5}
            icon={<TrendUp size={20} />}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
          sx={{
            animation: 'fadeInUp 0.4s ease forwards',
            animationDelay: '0.2s',
            opacity: 0,
          }}
        >
          <StatCard
            title="Deployed"
            value={3}
            icon={<Rocket size={20} />}
            color={config.colors.success}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Recent Prototypes */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="overline"
              sx={{
                color: config.colors.textSecondary,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              Recent Prototypes
            </Typography>
          </Box>
          <Card>
            <CardContent sx={{ p: '12px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                <Button
                  variant="contained"
                  startIcon={<Plus size={14} />}
                  size="small"
                  onClick={() => navigate('/prototypes')}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  New Prototype
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {recentPrototypes.map((prototype, index) => (
                  <Card
                    key={prototype.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      transition: 'all 0.2s ease',
                      animation: 'fadeInUp 0.4s ease forwards',
                      animationDelay: `${0.3 + index * 0.05}s`,
                      opacity: 0,
                      '&:hover': {
                        transform: 'translateX(4px)',
                        borderColor: config.colors.primary,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <CardActionArea onClick={() => navigate(`/prototypes/${prototype.id}`)}>
                      <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {/* Icon box */}
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              background: mode === 'modern' && config.gradients
                                ? config.gradients.primary
                                : config.colors.bgDark,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Flask size={16} color={mode === 'modern' ? 'white' : config.colors.primary} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 400 }}>
                              {prototype.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              Updated {prototype.updatedAt}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {prototype.views > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {prototype.views} views
                            </Typography>
                          )}
                          <Chip
                            label={prototype.status}
                            size="small"
                            color={getStatusColor(prototype.status)}
                          />
                        </Box>
                      </Box>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Recent Insights */}
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="overline"
              sx={{
                color: config.colors.textSecondary,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              Recent Insights
            </Typography>
          </Box>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: '12px !important' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {recentInsights.map((insight, index) => (
                  <Box
                    key={insight.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: config.colors.bgSecondary,
                      transition: 'all 0.2s ease',
                      animation: 'fadeInUp 0.4s ease forwards',
                      animationDelay: `${0.4 + index * 0.05}s`,
                      opacity: 0,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                        {insight.prototypeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {insight.metric}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendUp size={14} color={config.colors.success} />
                      <Typography variant="caption" sx={{ color: config.colors.success, fontWeight: 500 }}>
                        {insight.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Button
                fullWidth
                variant="text"
                size="small"
                sx={{ mt: 1.5 }}
                onClick={() => navigate('/insights')}
              >
                View All Insights
              </Button>
            </CardContent>
          </Card>

          {/* Deployed Prototypes */}
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="overline"
              sx={{
                color: config.colors.textSecondary,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              Deployments
            </Typography>
          </Box>
          <Card>
            <CardContent sx={{ p: '12px !important' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {deployedPrototypes.map((item) => (
                  <Box key={item.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                        {item.name}
                      </Typography>
                      <Chip
                        label={item.environment}
                        size="small"
                        color={item.environment === 'Production' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      sx={{ mb: 0.5, height: 4, borderRadius: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {item.deployedAt}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
