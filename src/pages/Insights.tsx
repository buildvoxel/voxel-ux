import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import TimerIcon from '@mui/icons-material/Timer';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { StatCard } from '@/components';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';

// Mock data
const projectsData = [
  {
    id: '1',
    name: 'E-commerce Checkout Flow',
    variants: 4,
    totalViews: 2340,
    totalClicks: 890,
    avgEngagement: 245,
    topConversion: 15.3,
    status: 'shared',
  },
  {
    id: '2',
    name: 'Dashboard Redesign',
    variants: 2,
    totalViews: 1250,
    totalClicks: 450,
    avgEngagement: 180,
    topConversion: 12.1,
    status: 'shared',
  },
  {
    id: '3',
    name: 'Mobile App Onboarding',
    variants: 3,
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
  const [dateRange, setDateRange] = useState('30d');

  const totalViews = projectsData.reduce((sum, p) => sum + p.totalViews, 0);
  const totalClicks = projectsData.reduce((sum, p) => sum + p.totalClicks, 0);
  const avgEngagement = Math.round(
    projectsData.reduce((sum, p) => sum + p.avgEngagement, 0) / projectsData.length
  );
  const avgConversion =
    projectsData.reduce((sum, p) => sum + p.topConversion, 0) / projectsData.length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track engagement and optimize variant performance
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={dateRange}
            label="Date Range"
            onChange={(e) => setDateRange(e.target.value)}
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value={formatNumber(totalViews)}
            icon={<VisibilityOutlinedIcon />}
            trend={{ direction: 'up', value: 12.5 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clicks"
            value={formatNumber(totalClicks)}
            icon={<TouchAppIcon />}
            trend={{ direction: 'up', value: 8.3 }}
            color="#52c41a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Engagement"
            value={formatTime(avgEngagement)}
            icon={<TimerIcon />}
            trend={{ direction: 'down', value: 3.2 }}
            color="#faad14"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Conversion"
            value={`${avgConversion.toFixed(1)}%`}
            icon={<TrophyIcon />}
            trend={{ direction: 'up', value: 15.7 }}
            color="#eb2f96"
          />
        </Grid>
      </Grid>

      {/* Projects Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Project Performance
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Variants</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Clicks</TableCell>
                  <TableCell align="right">Avg. Engagement</TableCell>
                  <TableCell align="right">Top Conversion</TableCell>
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
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={500}>{project.name}</Typography>
                        <Chip
                          label={project.status}
                          size="small"
                          color={project.status === 'deployed' ? 'success' : 'primary'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{project.variants}</TableCell>
                    <TableCell align="right">{formatNumber(project.totalViews)}</TableCell>
                    <TableCell align="right">{formatNumber(project.totalClicks)}</TableCell>
                    <TableCell align="right">{formatTime(project.avgEngagement)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                        <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography color="success.main" fontWeight={500}>
                          {project.topConversion}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

// Project View
function ProjectView({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
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
        <IconButton onClick={() => navigate('/insights')}>
          <ArrowBackIcon />
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
            icon={<VisibilityOutlinedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clicks"
            value={formatNumber(project.totalClicks)}
            icon={<TouchAppIcon />}
            color="#52c41a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Engagement"
            value={formatTime(project.avgEngagement)}
            icon={<TimerIcon />}
            color="#faad14"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Top Conversion"
            value={`${project.topConversion}%`}
            icon={<TrophyIcon />}
            color="#eb2f96"
          />
        </Grid>
      </Grid>

      {/* Variants Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Variant Performance
          </Typography>
          <TableContainer>
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
                        <Typography fontWeight={500}>{variant.label}</Typography>
                        {variant.isTopPerformer && (
                          <Chip label="Top" size="small" color="warning" icon={<TrophyIcon />} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatNumber(variant.views)}</TableCell>
                    <TableCell align="right">{formatNumber(variant.clicks)}</TableCell>
                    <TableCell align="right">
                      <Typography
                        color={variant.isTopPerformer ? 'success.main' : 'text.primary'}
                        fontWeight={variant.isTopPerformer ? 600 : 400}
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
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption">{variant.scrollDepth}%</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

// Variant View
function VariantView({ projectId, variantId }: { projectId: string; variantId: string }) {
  const navigate = useNavigate();
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
        <IconButton onClick={() => navigate(`/insights/${projectId}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>
          {variant.label}
        </Typography>
        {variant.isTopPerformer && (
          <Chip label="Top Performer" color="warning" icon={<TrophyIcon />} />
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
                icon={<VisibilityOutlinedIcon />}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                title="Clicks"
                value={formatNumber(variant.clicks)}
                icon={<TouchAppIcon />}
                color="#52c41a"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                title="Conversion"
                value={`${variant.conversionRate}%`}
                icon={<TrophyIcon />}
                color="#eb2f96"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                title="Avg. Time"
                value={formatTime(variant.avgTimeSpent)}
                icon={<TimerIcon />}
                color="#faad14"
              />
            </Grid>
          </Grid>

          {/* Scroll Depth */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Scroll Depth Analysis
              </Typography>
              <Box sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Average Scroll Depth</Typography>
                  <Typography fontWeight={600}>{variant.scrollDepth}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={variant.scrollDepth}
                  sx={{ height: 12, borderRadius: 6 }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Feedback Summary */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                User Feedback Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1, borderLeft: '4px solid', borderColor: 'success.main' }}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    Positive Feedback (12)
                  </Typography>
                  <Typography variant="body2">
                    Users appreciated the clean layout and intuitive navigation flow.
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1, borderLeft: '4px solid', borderColor: 'warning.main' }}>
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    Suggestions (5)
                  </Typography>
                  <Typography variant="body2">
                    Some users requested larger buttons and more contrast on CTAs.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={4}>
          <Card>
            <Box
              sx={{
                height: 300,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="white">
                {variant.label} Preview
              </Typography>
            </Box>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                {project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
