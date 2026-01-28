/**
 * VibePrototyping Page - Redesigned to match wireframes
 *
 * Layout:
 * - Top: Toolbar with project name, icons, Pages dropdown, Share button
 * - Left: Gray panel with AI phases, variant cards, and prompt input
 * - Right: White canvas with 2x2 variant grid or single focused variant
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { Code, At, Flag, DownloadSimple, ArrowCounterClockwise, Paperclip, ShareNetwork, Microphone, Warning } from '@phosphor-icons/react';

import { useSnackbar } from '@/components/SnackbarProvider';
import { useScreensStore } from '@/store/screensStore';
import { useVibeStore, type ChatMessage } from '@/store/vibeStore';
import { useContextStore } from '@/store/contextStore';

import {
  analyzeScreen,
  getCachedMetadata,
  type UIMetadata,
} from '@/services/screenAnalyzerService';
import {
  createVibeSession,
  generateVariantPlan,
  getVibeSession,
  getVariantPlans,
  approvePlan,
} from '@/services/variantPlanService';
import {
  generateAllVariants,
  getVariants,
} from '@/services/variantCodeService';

// Not found component
function NotFoundResult({ onBack }: { onBack: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        textAlign: 'center',
      }}
    >
      <Warning size={64} weight="light" style={{ color: '#faad14', marginBottom: 16 }} />
      <Typography variant="h5" gutterBottom>
        Screen Not Found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The screen you're looking for doesn't exist.
      </Typography>
      <Button variant="contained" onClick={onBack}>
        Go to Screens
      </Button>
    </Box>
  );
}

// AI Phase component for Understanding, Planning, Summary
function AIPhase({
  label,
  description,
  isActive = false
}: {
  label: string;
  description: string;
  isActive?: boolean;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          color: '#26a69a', // Teal color from wireframe
          fontSize: 14,
          fontWeight: 500,
          mb: 0.5,
        }}
      >
        {label}
        {isActive && '...'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  );
}

// Variant Card in the left panel
function VariantCard({
  title,
  description,
  isSelected = false,
  onClick
}: {
  title: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        border: isSelected ? '2px solid #764ba2' : '1px solid #e0e0e0',
        backgroundColor: 'white',
        '&:hover': onClick ? {
          borderColor: '#764ba2',
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

// Canvas variant preview card (in 2x2 grid)
function CanvasVariantCard({
  label,
  isLoading = false,
  htmlUrl,
  onClick,
}: {
  label: string;
  isLoading?: boolean;
  htmlUrl?: string | null;
  onClick?: () => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          borderColor: '#764ba2',
          boxShadow: 2,
        } : {},
      }}
    >
      <CardActionArea
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        onClick={onClick}
        disabled={!onClick}
      >
        <Box
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            position: 'relative',
            minHeight: 200,
          }}
        >
          {isLoading ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Loading state of {label}
              </Typography>
            </Box>
          ) : htmlUrl ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <iframe
                src={htmlUrl}
                title={label}
                style={{
                  width: '200%',
                  height: '200%',
                  border: 'none',
                  transform: 'scale(0.5)',
                  transformOrigin: 'top left',
                  pointerEvents: 'none',
                }}
              />
            </Box>
          ) : (
            <Typography color="text.secondary">{label}</Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}

export const VibePrototyping: React.FC = () => {
  const { screenId, sessionId } = useParams<{ screenId: string; sessionId?: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();

  // External stores
  const { getScreenById, initializeScreens, screens } = useScreensStore();
  const { contexts } = useContextStore();

  // Vibe store
  const {
    sourceMetadata,
    plan,
    variants,
    status,
    initSession,
    setSession,
    clearSession,
    setSourceMetadata,
    setAnalyzing,
    setPlan,
    approvePlan: storeApprovePlan,
    setVariants,
    setStatus,
    setProgress,
    setError,
    addMessage,
    getPlanByIndex,
    getVariantByIndex,
  } = useVibeStore();

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState<ReturnType<typeof getScreenById> | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [focusedVariantIndex, setFocusedVariantIndex] = useState<number | null>(null);

  // Initialize screen data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      // Fetch screens if empty
      if (screens.length === 0) {
        await initializeScreens();
      }

      // Get screen
      if (screenId) {
        const s = getScreenById(screenId);
        setScreen(s);

        if (s?.editedHtml) {
          // Check for cached metadata
          const cached = await getCachedMetadata(screenId);
          if (cached) {
            setSourceMetadata(cached as unknown as UIMetadata);
          }

          // If session ID provided, load existing session
          if (sessionId) {
            const session = await getVibeSession(sessionId);
            if (session) {
              initSession(session, s.editedHtml);

              // Load plans and variants
              const plans = await getVariantPlans(sessionId);
              if (plans.length > 0) {
                setPlan({ plans, model: '', provider: '' });
              }

              const existingVariants = await getVariants(sessionId);
              if (existingVariants.length > 0) {
                setVariants(existingVariants);
              }
            }
          } else {
            // No session, clear state for new session
            clearSession();
          }
        }
      }

      setIsLoading(false);
    };

    init();
  }, [screenId, sessionId]);

  // Add chat message helper
  const addChatMessage = useCallback(
    (
      role: ChatMessage['role'],
      content: string,
      msgStatus?: ChatMessage['status'],
      metadata?: ChatMessage['metadata']
    ) => {
      return addMessage({ role, content, status: msgStatus, metadata });
    },
    [addMessage]
  );

  // Handle Build button click
  const handleBuild = useCallback(async () => {
    if (!screen?.editedHtml || !screenId || !promptValue.trim()) return;

    const prompt = promptValue.trim();
    setPromptValue('');

    try {
      // Add user message
      addChatMessage('user', prompt);

      // Create new session
      const sessionName = `Vibe: ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`;
      const session = await createVibeSession(screenId, sessionName, prompt);

      if (!session) {
        throw new Error('Failed to create session');
      }

      // Initialize store with session
      initSession(session, screen.editedHtml);

      // Update URL with session ID
      navigate(`/prototypes/${screenId}/${session.id}`, { replace: true });

      // Analyze screen if not cached
      setAnalyzing(true, 'Analyzing screen design...');

      let metadata = sourceMetadata;
      if (!metadata) {
        const result = await analyzeScreen(screenId, screen.editedHtml, (p) => {
          setProgress({
            stage: 'analyzing',
            message: p.message,
            percent: p.percent,
          });
        });
        metadata = result.metadata;
        setSourceMetadata(metadata);
      }

      // Generate variant plan
      setStatus('planning');
      setProgress({
        stage: 'planning',
        message: 'AI is designing 4 variants...',
        percent: 30,
      });

      const result = await generateVariantPlan(
        session.id,
        prompt,
        screen.editedHtml,
        metadata,
        undefined,
        (p) => {
          setProgress({
            stage: 'planning',
            message: p.message,
            percent: 30 + p.percent * 0.4,
          });
        }
      );

      setPlan({
        plans: result.plans,
        model: result.model,
        provider: result.provider,
      });

      setSession(result.session);

      // Auto-approve and start generating
      const approvedSession = await approvePlan(session.id);
      if (approvedSession) {
        storeApprovePlan();
      }

      // Start generating variants
      setStatus('generating');
      setProgress({
        stage: 'generating',
        message: 'Starting code generation...',
        percent: 0,
      });

      // Generate all variants
      const generatedVariants = await generateAllVariants(
        session.id,
        result.plans,
        screen.editedHtml,
        metadata || undefined,
        undefined,
        (p) => {
          setProgress({
            stage: 'generating',
            message: p.message,
            percent: p.percent,
            variantIndex: p.variantIndex,
            variantTitle: p.title,
          });

          // Update individual variant in store as it completes
          if (p.stage === 'complete') {
            getVariants(session.id).then(setVariants);
          }
        }
      );

      setVariants(generatedVariants);
      setStatus('complete');
      setProgress(null);

      showSuccess('All variants generated successfully!');
    } catch (err) {
      console.error('Error generating plan:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(errorMsg);
      showError('Failed to generate variant plan');
    }
  }, [screen, screenId, promptValue, sourceMetadata, contexts]);

  // Handle variant selection (from canvas)
  const handleVariantClick = useCallback((index: number) => {
    setFocusedVariantIndex(index);
  }, []);

  // Handle back from focused variant
  const handleBackToGrid = useCallback(() => {
    setFocusedVariantIndex(null);
  }, []);


  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  // No screen found
  if (!screen) {
    return <NotFoundResult onBack={() => navigate('/repository/screens')} />;
  }

  // Get current phase
  const isAnalyzing = status === 'analyzing';
  const isPlanning = status === 'planning';
  const isGenerating = status === 'generating';
  const isComplete = status === 'complete';
  const hasVariants = variants.length > 0;

  // Project name for header
  const projectName = screen.name || 'Project name';
  const focusedVariant = focusedVariantIndex ? getVariantByIndex(focusedVariantIndex) : null;
  const focusedPlan = focusedVariantIndex ? getPlanByIndex(focusedVariantIndex) : null;

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Box
        sx={{
          height: 48,
          px: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
        }}
      >
        {/* Left: Project name / breadcrumb */}
        <Typography variant="subtitle1" fontWeight={500}>
          {focusedVariantIndex && focusedPlan
            ? `${projectName} > ${focusedPlan.title}`
            : projectName}
        </Typography>

        {/* Center: Icons and Pages dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small">
            <Code size={20} />
          </IconButton>
          <IconButton size="small">
            <At size={20} />
          </IconButton>
          <IconButton size="small">
            <Flag size={20} />
          </IconButton>
          <IconButton size="small">
            <DownloadSimple size={20} />
          </IconButton>
          <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 1 }} />
          <IconButton size="small" onClick={handleBackToGrid} disabled={!focusedVariantIndex}>
            <ArrowCounterClockwise size={20} />
          </IconButton>
          <Box
            sx={{
              px: 2,
              py: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              minWidth: 100,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">Pages /</Typography>
          </Box>
        </Box>

        {/* Right: Share button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<ShareNetwork size={18} />}
          sx={{ textTransform: 'none' }}
        >
          Share
        </Button>
      </Box>

      {/* Main content area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Gray AI Panel */}
        <Box
          sx={{
            width: 320,
            bgcolor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* AI Phases and Variant Cards */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* Initial empty state */}
            {status === 'idle' && !plan && (
              <Box sx={{ height: '100%' }} />
            )}

            {/* Understanding phase */}
            {(isAnalyzing || isPlanning || isGenerating || isComplete) && (
              <AIPhase
                label="Understanding"
                description="Acknowledging the request and providing a summary of the task understanding"
                isActive={isAnalyzing}
              />
            )}

            {/* Planning phase */}
            {(isPlanning || isGenerating || isComplete) && (
              <AIPhase
                label="Planning"
                description="Explaining the planning strategy and breaking this into 4 solution directions"
                isActive={isPlanning}
              />
            )}

            {/* Variant cards during planning/generating */}
            {(isPlanning || isGenerating) && plan?.plans && (
              <Box sx={{ mt: 2 }}>
                {plan.plans.map((p, idx) => (
                  <VariantCard
                    key={p.id || idx}
                    title={p.title || `Variant ${idx + 1}`}
                    description={p.description || 'Description of the UI and UX approach of this variant'}
                  />
                ))}
              </Box>
            )}

            {/* Summary phase when complete */}
            {isComplete && (
              <AIPhase
                label="Summary"
                description="Explaining the 4 variants approached in high level details. Calling to action to click on each, explore and switch between them to see in full screen."
              />
            )}
          </Box>

          {/* Prompt Input at bottom */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder="Create a invite option to this page"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              disabled={isAnalyzing || isPlanning || isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && promptValue.trim()) {
                  e.preventDefault();
                  handleBuild();
                }
              }}
              sx={{
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              <IconButton size="small">
                <Microphone size={20} />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small">
                  <Paperclip size={20} />
                </IconButton>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleBuild}
                  disabled={!promptValue.trim() || isAnalyzing || isPlanning || isGenerating}
                  sx={{
                    textTransform: 'none',
                    minWidth: 60,
                    bgcolor: 'grey.700',
                    '&:hover': { bgcolor: 'grey.800' },
                  }}
                >
                  Build
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Panel - White Canvas */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Initial empty state */}
          {status === 'idle' && !hasVariants && (
            <Box sx={{ flex: 1 }} />
          )}

          {/* Loading/Planning state - 2x2 grid with loading indicators */}
          {(isAnalyzing || isPlanning || isGenerating) && !focusedVariantIndex && (
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                {['Variant A', 'Variant B', 'Variant C', 'Variant D'].map((label, idx) => {
                  const variant = variants.find((v) => v.variant_index === idx + 1);
                  return (
                    <Grid item xs={6} key={label} sx={{ height: '50%' }}>
                      <CanvasVariantCard
                        label={label}
                        isLoading={!variant || variant.status !== 'complete'}
                        htmlUrl={variant?.html_url}
                        onClick={variant?.status === 'complete' ? () => handleVariantClick(idx + 1) : undefined}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Complete state - 2x2 grid with variants */}
          {isComplete && !focusedVariantIndex && (
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                {['Variant A', 'Variant B', 'Variant C', 'Variant D'].map((label, idx) => {
                  const variant = getVariantByIndex(idx + 1);
                  return (
                    <Grid item xs={6} key={label} sx={{ height: '50%' }}>
                      <CanvasVariantCard
                        label={label}
                        htmlUrl={variant?.html_url}
                        onClick={() => handleVariantClick(idx + 1)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Focused variant - single full preview */}
          {focusedVariantIndex && focusedVariant && (
            <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    position: 'relative',
                    backgroundColor: '#fafafa',
                  }}
                >
                  {focusedVariant.html_url ? (
                    <iframe
                      src={focusedVariant.html_url}
                      title={`Preview Variant ${focusedVariantIndex}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">
                        Preview Variant {String.fromCharCode(64 + focusedVariantIndex)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VibePrototyping;
