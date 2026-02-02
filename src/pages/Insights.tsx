import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import {
  Eye,
  Trophy,
  ChatCircle,
  PushPin,
  CheckCircle,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { Card, CardContent, Button, Chip } from '@/components/ui';
import { useThemeStore } from '@/store/themeStore';
import { PageHeader } from '@/components';
import {
  getProjectInsights,
  getVariantInsights,
  getVariantDetailInsight,
  type ProjectInsight,
  type VariantInsight,
  type VariantDetailInsight,
} from '@/services/feedbackInsightsService';

// Fallback mock data for demo when no real data exists
const mockProjectsData: ProjectInsight[] = [
  {
    id: '1',
    sessionId: '1',
    name: 'E-commerce Checkout Flow',
    creatorEmail: 'sarah@example.com',
    variants: 4,
    participants: 12,
    comments: 24,
    totalTimeSpent: '4h 32m',
    totalViews: 2340,
    status: 'shared',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    sessionId: '2',
    name: 'Dashboard Redesign',
    creatorEmail: 'mike@example.com',
    variants: 2,
    participants: 8,
    comments: 15,
    totalTimeSpent: '2h 18m',
    totalViews: 1250,
    status: 'shared',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    sessionId: '3',
    name: 'Mobile App Onboarding',
    creatorEmail: 'emma@example.com',
    variants: 3,
    participants: 15,
    comments: 32,
    totalTimeSpent: '6h 45m',
    totalViews: 5670,
    status: 'shared',
    createdAt: new Date().toISOString(),
  },
];

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// All Projects View
function AllProjectsView() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const data = await getProjectInsights();
        setProjects(data.length > 0 ? data : mockProjectsData);
      } catch (err) {
        console.error('Error loading projects:', err);
        setProjects(mockProjectsData);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Stats
  const activeProjects = projects.filter((p) => p.status === 'shared').length;
  const totalProjects = projects.length;
  const avgVariantsPerProject =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.variants, 0) / projects.length)
      : 0;
  const totalParticipants = projects.reduce((sum, p) => sum + p.participants, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Insights" />

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 100,
            }}
          >
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
          <Card
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 100,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Avg. variants per project
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {avgVariantsPerProject}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 100,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Engaged participants
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {totalParticipants}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Table */}
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
            {projects.map((project) => (
              <TableRow
                key={project.id}
                hover
                onClick={() => navigate(`/insights/${project.sessionId}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {project.name}
                    {project.status === 'shared' && (
                      <Chip size="small" label="Active" color="success" sx={{ height: 20, fontSize: 10 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{project.creatorEmail}</TableCell>
                <TableCell align="center">{project.variants}</TableCell>
                <TableCell align="center">{project.participants}</TableCell>
                <TableCell align="center">{project.comments}</TableCell>
                <TableCell align="right">{project.totalTimeSpent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {projects.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ChatCircle size={48} color="#ccc" />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No shared projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share a prototype to start collecting feedback
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// Project View
function ProjectView({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const { config } = useThemeStore();
  const [variants, setVariants] = useState<VariantInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('Project');

  useEffect(() => {
    async function loadVariants() {
      setLoading(true);
      try {
        const data = await getVariantInsights(projectId);
        setVariants(data);
        // Try to get project name from mock data or use default
        const mockProject = mockProjectsData.find((p) => p.id === projectId);
        if (mockProject) {
          setProjectName(mockProject.name);
        }
      } catch (err) {
        console.error('Error loading variants:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVariants();
  }, [projectId]);

  // Stats
  const totalVariants = variants.length;
  const totalParticipants = variants.reduce((sum, v) => sum + v.participants, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

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
        <Typography variant="h5" fontWeight={500} color="text.secondary">
          {'>'}
        </Typography>
        <Typography variant="h5" fontWeight={500}>
          {projectName}
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 100,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total variants
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {totalVariants}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 100,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total comments
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {variants.reduce((sum, v) => sum + v.comments, 0)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 100,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Engaged participants
            </Typography>
            <Typography variant="h5" fontWeight={500}>
              {totalParticipants}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Variants Table */}
      <TableContainer component={Card} sx={{ border: 'none' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: config.colors.bgSecondary }}>
              <TableCell sx={{ fontWeight: 600 }}>Variant</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Sessions
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Participants
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Comments
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Time spent
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variants.map((variant) => (
              <TableRow
                key={variant.variantIndex}
                hover
                onClick={() => navigate(`/insights/${projectId}/${variant.variantIndex}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {variant.title || variant.label}
                    {variant.isTopPerformer && <Trophy size={16} weight="fill" color="#ffc107" />}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                    {variant.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">{variant.sessions}</TableCell>
                <TableCell align="center">{variant.participants}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    {variant.comments}
                    {variant.resolvedComments > 0 && (
                      <Tooltip title={`${variant.resolvedComments} resolved`}>
                        <CheckCircle size={14} color="#2e7d32" weight="fill" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">{variant.totalTimeSpent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {variants.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Eye size={48} color="#ccc" />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No variants found
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// Variant View
function VariantView({ projectId, variantId }: { projectId: string; variantId: string }) {
  const navigate = useNavigate();
  const { config } = useThemeStore();
  const [detail, setDetail] = useState<VariantDetailInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('Project');

  const variantIndex = parseInt(variantId, 10);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const data = await getVariantDetailInsight(projectId, variantIndex);
        setDetail(data);
        // Try to get project name
        const mockProject = mockProjectsData.find((p) => p.id === projectId);
        if (mockProject) {
          setProjectName(mockProject.name);
        }
      } catch (err) {
        console.error('Error loading variant detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [projectId, variantIndex]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!detail) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">Variant not found</Typography>
        <Button onClick={() => navigate(`/insights/${projectId}`)} sx={{ mt: 2 }}>
          Back to project
        </Button>
      </Box>
    );
  }

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
        <Typography variant="h5" fontWeight={500} color="text.secondary">
          {'>'}
        </Typography>
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
          {projectName}
        </Typography>
        <Typography variant="h5" fontWeight={500} color="text.secondary">
          {'>'}
        </Typography>
        <Typography variant="h5" fontWeight={500}>
          {detail.title || detail.label}
        </Typography>
        {detail.isTopPerformer && <Trophy size={20} weight="fill" color="#ffc107" />}
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
                  {detail.sessions}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', minHeight: 90 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Unique participants
                </Typography>
                <Typography variant="h5" fontWeight={500}>
                  {detail.participants}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', minHeight: 90 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Time per session
                </Typography>
                <Typography variant="h5" fontWeight={500}>
                  {formatTime(detail.avgTimeSpent)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', minHeight: 90 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Feedback shared
                </Typography>
                <Typography variant="h5" fontWeight={500}>
                  {detail.comments.length}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Variant Thumbnail / Actions */}
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                {detail.label}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowsClockwise size={16} />}
                onClick={() => navigate(`/vibe/${projectId}`)}
              >
                Create iteration
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main content: Left (Feedback Summary + Funnel) + Right (Feedback Shared) */}
      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left Column */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Feedback Summary */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Feedback summary
              </Typography>
            </Box>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {detail.feedbackSummary}
                </Typography>
                {detail.keyThemes.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {detail.keyThemes.map((theme, idx) => (
                      <Chip key={idx} size="small" label={theme} variant="outlined" />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Participants Funnel */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Participants funnel
              </Typography>
            </Box>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {detail.participantsFunnel.map((step, index) => (
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
                            backgroundColor:
                              index === 0
                                ? config.colors.primary
                                : index === detail.participantsFunnel.length - 1
                                ? config.colors.success
                                : config.colors.textSecondary,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Right Column: Feedback Shared */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexShrink: 0 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Feedback shared
            </Typography>
            <Chip size="small" label={detail.comments.length} />
          </Box>
          <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
              {detail.comments.length === 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChatCircle size={48} color="#ccc" />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    No feedback yet
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    flex: 1,
                    overflow: 'auto',
                  }}
                >
                  {detail.comments.map((fb) => (
                    <Box
                      key={fb.id}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        pb: 1.5,
                        opacity: fb.resolved ? 0.6 : 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: 'primary.main' }}>
                            {getInitials(fb.userName)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {fb.userName}
                          </Typography>
                          {fb.positionX !== null && (
                            <Tooltip title="Pin comment">
                              <PushPin size={12} />
                            </Tooltip>
                          )}
                          {fb.resolved && (
                            <Tooltip title="Resolved">
                              <CheckCircle size={14} color="#2e7d32" weight="fill" />
                            </Tooltip>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(fb.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {fb.content}
                      </Typography>
                      {fb.replyCount > 0 && (
                        <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                          {fb.replyCount} {fb.replyCount === 1 ? 'reply' : 'replies'}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
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
