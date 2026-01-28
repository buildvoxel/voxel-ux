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
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import {
  ArrowLeft,
  Eye,
  CursorClick,
  Timer,
  Trophy,
} from '@phosphor-icons/react';
import { StatCard } from '@/components';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
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

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

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
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
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
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Avg. number variants per projects
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {avgVariantsPerProject}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
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

// Project View
function ProjectView({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const { config } = useThemeStore();
  const project = projectsData.find((p) => p.id === projectId);

  if (!project) {
    return <Typography>Project not found</Typography>;
  }

  return (
    <Box>
      <BreadcrumbNav
        items={[
          { label: 'Insights', path: '/insights' },
          { label: project.name },
        ]}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/insights')} size="small">
          <ArrowLeft size={20} />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>
          {project.name}
        </Typography>
        <Chip
          label={project.status}
          color={project.status === 'deployed' ? 'success' : 'primary'}
        />
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value={formatNumber(project.totalViews)}
            icon={<Eye size={20} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clicks"
            value={formatNumber(project.totalClicks)}
            icon={<CursorClick size={20} />}
            color="#52c41a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Engagement"
            value={formatTime(project.avgEngagement)}
            icon={<Timer size={20} />}
            color="#faad14"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Top Conversion"
            value={`${project.topConversion}%`}
            icon={<Trophy size={20} />}
            color="#eb2f96"
          />
        </Grid>
      </Grid>

      {/* Variants Table */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            color: config.colors.textSecondary,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          Variant Performance
        </Typography>
      </Box>
      <TableContainer component={Card} sx={{ border: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Variant</TableCell>
              <TableCell align="right">Views</TableCell>
              <TableCell align="right">Clicks</TableCell>
              <TableCell align="right">Conversion Rate</TableCell>
              <TableCell align="right">Avg. Time</TableCell>
              <TableCell>Scroll Depth</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variantsData.map((variant) => (
              <TableRow
                key={variant.id}
                hover
                onClick={() => navigate(`/insights/${projectId}/${variant.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {variant.label}
                    {variant.isTopPerformer && (
                      <Chip label="Top" size="small" color="warning" icon={<Trophy size={12} />} />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">{formatNumber(variant.views)}</TableCell>
                <TableCell align="right">{formatNumber(variant.clicks)}</TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      color: variant.isTopPerformer ? config.colors.success : 'inherit',
                      fontWeight: variant.isTopPerformer ? 500 : 400,
                    }}
                  >
                    {variant.conversionRate}%
                  </Typography>
                </TableCell>
                <TableCell align="right">{formatTime(variant.avgTimeSpent)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={variant.scrollDepth}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {variant.scrollDepth}%
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Variant View
function VariantView({ projectId, variantId }: { projectId: string; variantId: string }) {
  const navigate = useNavigate();
  const { config } = useThemeStore();
  const project = projectsData.find((p) => p.id === projectId);
  const variant = variantsData.find((v) => v.id === variantId);

  if (!project || !variant) {
    return <Typography>Not found</Typography>;
  }

  return (
    <Box>
      <BreadcrumbNav
        items={[
          { label: 'Insights', path: '/insights' },
          { label: project.name, path: `/insights/${projectId}` },
          { label: variant.label },
        ]}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(`/insights/${projectId}`)} size="small">
          <ArrowLeft size={20} />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>
          {variant.label}
        </Typography>
        {variant.isTopPerformer && (
          <Chip label="Top Performer" color="warning" icon={<Trophy size={14} />} />
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <StatCard
                title="Views"
                value={formatNumber(variant.views)}
                icon={<Eye size={20} />}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                title="Clicks"
                value={formatNumber(variant.clicks)}
                icon={<CursorClick size={20} />}
                color="#52c41a"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                title="Conversion"
                value={`${variant.conversionRate}%`}
                icon={<Trophy size={20} />}
                color="#eb2f96"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                title="Avg. Time"
                value={formatTime(variant.avgTimeSpent)}
                icon={<Timer size={20} />}
                color="#faad14"
              />
            </Grid>
          </Grid>

          {/* Scroll Depth */}
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="overline"
              sx={{
                color: config.colors.textSecondary,
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                display: 'block',
                mb: 1,
              }}
            >
              Scroll Depth Analysis
            </Typography>
            <Card>
              <CardContent>
                <Box sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Average Scroll Depth
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {variant.scrollDepth}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={variant.scrollDepth}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Feedback Summary */}
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="overline"
              sx={{
                color: config.colors.textSecondary,
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                display: 'block',
                mb: 1,
              }}
            >
              User Feedback Summary
            </Typography>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: config.colors.successBg,
                      borderRadius: 1,
                      borderLeft: '3px solid',
                      borderColor: config.colors.success,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: config.colors.success,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Positive Feedback (12)
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Users appreciated the clean layout and intuitive navigation flow.
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: config.colors.warningBg,
                      borderRadius: 1,
                      borderLeft: '3px solid',
                      borderColor: config.colors.warning,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: config.colors.warning,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Suggestions (5)
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Some users requested larger buttons and more contrast on CTAs.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="overline"
            sx={{
              color: config.colors.textSecondary,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              display: 'block',
              mb: 1,
            }}
          >
            Preview
          </Typography>
          <Card>
            <Box
              sx={{
                height: 300,
                backgroundColor: config.colors.bgDark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="white" sx={{ opacity: 0.6 }}>
                {variant.label} Preview
              </Typography>
            </Box>
            <CardContent>
              <Typography variant="body2" fontWeight={500}>
                {project.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {variant.label}
              </Typography>
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
