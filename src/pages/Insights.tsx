import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Eye,
  Trophy,
} from '@phosphor-icons/react';
import { useThemeStore } from '@/store/themeStore';

// Mock data - Updated to match wireframe columns
const projectsData = [
  {
    id: '1',
    name: 'E-commerce Checkout Flow',
    creator: 'Sarah Chen',
    variants: 4,
    participants: 12,
    comments: 24,
    totalTimeSpent: '4h 32m',
    totalViews: 2340,
    totalClicks: 890,
    avgEngagement: 245,
    topConversion: 15.3,
    status: 'shared',
  },
  {
    id: '2',
    name: 'Dashboard Redesign',
    creator: 'Mike Johnson',
    variants: 2,
    participants: 8,
    comments: 15,
    totalTimeSpent: '2h 18m',
    totalViews: 1250,
    totalClicks: 450,
    avgEngagement: 180,
    topConversion: 12.1,
    status: 'shared',
  },
  {
    id: '3',
    name: 'Mobile App Onboarding',
    creator: 'Emma Wilson',
    variants: 3,
    participants: 15,
    comments: 32,
    totalTimeSpent: '6h 45m',
    totalViews: 5670,
    totalClicks: 2100,
    avgEngagement: 320,
    topConversion: 18.5,
    status: 'deployed',
  },
];

const variantsData = [
  {
    id: 'a',
    label: 'Variant A',
    views: 890,
    clicks: 234,
    conversionRate: 15.3,
    avgTimeSpent: 245,
    scrollDepth: 78,
    isTopPerformer: true,
  },
  {
    id: 'b',
    label: 'Variant B',
    views: 760,
    clicks: 198,
    conversionRate: 12.1,
    avgTimeSpent: 210,
    scrollDepth: 65,
    isTopPerformer: false,
  },
  {
    id: 'c',
    label: 'Variant C',
    views: 450,
    clicks: 112,
    conversionRate: 10.5,
    avgTimeSpent: 180,
    scrollDepth: 55,
    isTopPerformer: false,
  },
  {
    id: 'd',
    label: 'Variant D',
    views: 240,
    clicks: 56,
    conversionRate: 8.2,
    avgTimeSpent: 150,
    scrollDepth: 45,
    isTopPerformer: false,
  },
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

// All Projects View
function AllProjectsView() {
  const navigate = useNavigate();

  // Stats per wireframe
  const activeProjects = projectsData.filter(p => p.status === 'shared' || p.status === 'deployed').length;
  const totalProjects = projectsData.length;
  const avgVariantsPerProject = Math.round(
    projectsData.reduce((sum, p) => sum + p.variants, 0) / projectsData.length
  );
  const totalParticipants = projectsData.reduce((sum, p) => sum + p.participants, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Insights
        </Typography>
      </Box>

      {/* Stats Row - Per wireframe */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 100 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Number of projects
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {activeProjects}/{totalProjects}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (active/total)
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 100 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Avg. number variants per projects
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {avgVariantsPerProject}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 100 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Engaged participants
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {totalParticipants}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Table - Columns per wireframe */}
      <TableContainer component={Card} sx={{ border: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project name</TableCell>
              <TableCell>Creator</TableCell>
              <TableCell align="center">Variants</TableCell>
              <TableCell align="center">Participants</TableCell>
              <TableCell align="center">Comments</TableCell>
              <TableCell align="right">Total time spent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectsData.map((project) => (
              <TableRow
                key={project.id}
                hover
                onClick={() => navigate(`/insights/${project.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.creator}</TableCell>
                <TableCell align="center">{project.variants}</TableCell>
                <TableCell align="center">{project.participants}</TableCell>
                <TableCell align="center">{project.comments}</TableCell>
                <TableCell align="right">{project.totalTimeSpent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Project View - Per wireframe: Insights > Project name
function ProjectView({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const { config } = useThemeStore();
  const project = projectsData.find((p) => p.id === projectId);

  if (!project) {
    return <Typography>Project not found</Typography>;
  }

  // Project-specific variants data with wireframe columns
  const projectVariants = [
    { id: 'a', name: 'Variant A', description: '', sessions: 45, participants: 12, comments: 8, totalTimeSpent: '1h 15m', isTopPerformer: false },
    { id: 'b', name: 'Modern UX', description: 'Clean, minimalist approach', sessions: 62, participants: 18, comments: 12, totalTimeSpent: '2h 32m', isTopPerformer: true },
    { id: 'c', name: 'Gradual discovery', description: 'Progressive disclosure pattern', sessions: 38, participants: 9, comments: 5, totalTimeSpent: '58m', isTopPerformer: false },
    { id: 'd', name: 'Variant D', description: '', sessions: 28, participants: 6, comments: 3, totalTimeSpent: '42m', isTopPerformer: false },
  ];

  // Stats per wireframe
  const totalVariants = projectVariants.length;
  const avgVariants = Math.round(totalVariants / 1); // Per project
  const totalParticipants = projectVariants.reduce((sum, v) => sum + v.participants, 0);

  return (
    <Box>
      {/* Breadcrumb navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight={500}
          sx={{
            cursor: 'pointer',
            '&:hover': { color: config.colors.primary },
            transition: 'color 0.2s ease',
          }}
          onClick={() => navigate('/insights')}
        >
          Insights
        </Typography>
        <Typography variant="h5" fontWeight={500} color="text.secondary">{'>'}</Typography>
        <Typography variant="h5" fontWeight={500}>{project.name}</Typography>
      </Box>

      {/* Stats Row - Per wireframe: 3 cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 100 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Number of projects
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              1/1
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (active/total)
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 100 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Avg. number variants per projects
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {avgVariants}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 100 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Engaged participants
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {totalParticipants}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Variants Table - Columns per wireframe */}
      <TableContainer component={Card} sx={{ border: 'none' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: config.colors.bgSecondary }}>
              <TableCell sx={{ fontWeight: 600 }}>Variant name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center"># Sessions</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center"># Participants</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center"># Comments</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Total time spent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectVariants.map((variant) => (
              <TableRow
                key={variant.id}
                hover
                onClick={() => navigate(`/insights/${projectId}/${variant.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {variant.name}
                    {variant.isTopPerformer && (
                      <Trophy size={16} weight="fill" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{variant.description}</TableCell>
                <TableCell align="center">{variant.sessions}</TableCell>
                <TableCell align="center">{variant.participants}</TableCell>
                <TableCell align="center">{variant.comments}</TableCell>
                <TableCell align="right">{variant.totalTimeSpent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Variant View - Per wireframe: Insights > Project name > Variant name
function VariantView({ projectId, variantId }: { projectId: string; variantId: string }) {
  const navigate = useNavigate();
  const { config } = useThemeStore();
  const project = projectsData.find((p) => p.id === projectId);
  const variant = variantsData.find((v) => v.id === variantId);

  if (!project || !variant) {
    return <Typography>Not found</Typography>;
  }

  // Mock feedback data
  const feedbackComments = [
    { id: 1, user: 'Sarah Chen', comment: 'Love the clean layout! Very intuitive.', time: '2h ago' },
    { id: 2, user: 'Mike Johnson', comment: 'The CTA button could be more prominent.', time: '4h ago' },
    { id: 3, user: 'Emma Wilson', comment: 'Great flow, easy to navigate.', time: '1d ago' },
    { id: 4, user: 'Alex Rodriguez', comment: 'Navigation is smooth and intuitive.', time: '2d ago' },
    { id: 5, user: 'Jordan Lee', comment: 'Consider adding more visual hierarchy.', time: '3d ago' },
  ];

  // Funnel data
  const funnelSteps = [
    { label: 'Viewed', count: variant.views, percent: 100 },
    { label: 'Engaged', count: Math.round(variant.views * 0.65), percent: 65 },
    { label: 'Clicked CTA', count: variant.clicks, percent: Math.round((variant.clicks / variant.views) * 100) },
    { label: 'Completed', count: Math.round(variant.clicks * 0.4), percent: Math.round((variant.clicks * 0.4 / variant.views) * 100) },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      {/* Breadcrumb navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexShrink: 0 }}>
        <Typography
          variant="h5"
          fontWeight={500}
          sx={{
            cursor: 'pointer',
            '&:hover': { color: config.colors.primary },
            transition: 'color 0.2s ease',
          }}
          onClick={() => navigate('/insights')}
        >
          Insights
        </Typography>
        <Typography variant="h5" fontWeight={500} color="text.secondary">{'>'}</Typography>
        <Typography
          variant="h5"
          fontWeight={500}
          sx={{
            cursor: 'pointer',
            '&:hover': { color: config.colors.primary },
            transition: 'color 0.2s ease',
          }}
          onClick={() => navigate(`/insights/${projectId}`)}
        >
          {project.name}
        </Typography>
        <Typography variant="h5" fontWeight={500} color="text.secondary">{'>'}</Typography>
        <Typography variant="h5" fontWeight={500}>{variant.label}</Typography>
      </Box>

      {/* Top Section: Stats (2x2) + Thumbnail */}
      <Grid container spacing={3} sx={{ mb: 3, flexShrink: 0 }}>
        {/* Stats 2x2 Grid */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', minHeight: 90 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total sessions
                </Typography>
                <Typography variant="h5" fontWeight={500}>
                  {variant.views}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', minHeight: 90 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Unique participants
                </Typography>
                <Typography variant="h5" fontWeight={500}>
                  {Math.round(variant.views * 0.4)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', minHeight: 90 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Time spent per session
                </Typography>
                <Typography variant="h5" fontWeight={500}>
                  {formatTime(variant.avgTimeSpent)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', minHeight: 90 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Feedback shared
                </Typography>
                <Typography variant="h5" fontWeight={500}>
                  {feedbackComments.length}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Variant Thumbnail */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', minHeight: 180 }}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: config.colors.bgSecondary,
                p: 2,
              }}
            >
              <Eye size={32} color={config.colors.textSecondary} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Variant Thumbnail
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main content: Left (Feedback Summary + Funnel) + Right (Feedback Shared) */}
      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left Column: Feedback Summary + Funnel stacked */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Feedback Summary */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Feedback summary
                </Typography>
                <Box component="span" sx={{ fontSize: 14 }}>📋</Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Overall positive reception. Users appreciated the clean layout and intuitive navigation.
                Main suggestions focus on improving CTA visibility and button contrast.
              </Typography>
            </CardContent>
          </Card>

          {/* Participants Funnel */}
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Participants funnel
                </Typography>
                <Box component="span" sx={{ fontSize: 14 }}>📊</Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {funnelSteps.map((step, index) => (
                  <Box key={step.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{step.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {step.count} ({step.percent}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={step.percent}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: index === 0 ? config.colors.primary :
                            index === funnelSteps.length - 1 ? config.colors.success :
                            config.colors.textSecondary,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Feedback Shared - takes full height */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexShrink: 0 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Feedback shared
                </Typography>
                <Box component="span" sx={{ fontSize: 14 }}>💬</Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflow: 'auto' }}>
                {feedbackComments.map((fb) => (
                  <Box key={fb.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={500}>{fb.user}</Typography>
                      <Typography variant="caption" color="text.secondary">{fb.time}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{fb.comment}</Typography>
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

export function Insights() {
  const { projectId, variantId } = useParams();

  if (variantId && projectId) {
    return <VariantView projectId={projectId} variantId={variantId} />;
  }

  if (projectId) {
    return <ProjectView projectId={projectId} />;
  }

  return <AllProjectsView />;
}
