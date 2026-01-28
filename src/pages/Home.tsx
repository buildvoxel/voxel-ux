import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { StatCard } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { voxelColors, voxelFonts } from '@/theme/muiTheme';

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

  return (
    <Box>
      {/* Header - Instrument Serif for main heading */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: voxelFonts.display,
            fontSize: '2.25rem',
            fontWeight: 400,
            color: voxelColors.textPrimary,
            mb: 1,
          }}
        >
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your prototypes
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Prototypes"
            value={12}
            icon={<ScienceOutlinedIcon />}
            trend={{ direction: 'up', value: 8 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value="2.4K"
            icon={<VisibilityOutlinedIcon />}
            trend={{ direction: 'up', value: 12.5 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Shared"
            value={5}
            icon={<TrendingUpOutlinedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Deployed"
            value={3}
            icon={<RocketLaunchOutlinedIcon />}
            color={voxelColors.success}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Prototypes */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: voxelFonts.display,
                    fontSize: '1.25rem',
                    fontWeight: 400,
                  }}
                >
                  Recent Prototypes
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddOutlinedIcon />}
                  size="small"
                  onClick={() => navigate('/prototypes')}
                >
                  New Prototype
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentPrototypes.map((prototype) => (
                  <Card key={prototype.id} variant="outlined">
                    <CardActionArea onClick={() => navigate(`/prototypes/${prototype.id}`)}>
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {/* Icon box - Deep Charcoal with Brass icon */}
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              backgroundColor: voxelColors.bgDark,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ScienceOutlinedIcon sx={{ color: voxelColors.primary }} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {prototype.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Updated {prototype.updatedAt}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {prototype.views > 0 && (
                            <Typography variant="body2" color="text.secondary">
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
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: voxelFonts.display,
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  mb: 2,
                }}
              >
                Recent Insights
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentInsights.map((insight) => (
                  <Box
                    key={insight.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: voxelColors.bgSecondary,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {insight.prototypeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {insight.metric}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: voxelColors.success }} />
                      <Typography variant="body2" sx={{ color: voxelColors.success, fontWeight: 600 }}>
                        {insight.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 2 }}
                onClick={() => navigate('/insights')}
              >
                View All Insights
              </Button>
            </CardContent>
          </Card>

          {/* Deployed Prototypes */}
          <Card>
            <CardContent>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: voxelFonts.display,
                  fontSize: '1.25rem',
                  fontWeight: 400,
                  mb: 2,
                }}
              >
                Deployments
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {deployedPrototypes.map((item) => (
                  <Box key={item.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={500}>
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
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
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
