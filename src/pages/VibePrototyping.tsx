/**
 * VibePrototyping Page - "Vibe Coding" Style Interface
 *
 * Split-panel layout:
 * - Left: Screen preview with variant tabs
 * - Right: Chat panel for prompts and AI responses
 * - Bottom: Expandable sections for plans and source analysis
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Badge from '@mui/material/Badge';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BoltIcon from '@mui/icons-material/Bolt';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AppsIcon from '@mui/icons-material/Apps';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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
  updateVariantPlan,
  type VariantPlan,
} from '@/services/variantPlanService';
import {
  generateAllVariants,
  getVariants,
  selectVariant,
} from '@/services/variantCodeService';

import {
  SourceAnalysisPanel,
  PlanReviewGrid,
  VariantPreviewModal,
  ChatPanel,
  ScreenPreview,
  ModelSelector,
  type SelectedTab,
} from '@/components/Vibe';

// Result component for not found state
function NotFoundResult({
  onBack,
}: {
  onBack: () => void;
}) {
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
      <ErrorOutlineIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
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

export const VibePrototyping: React.FC = () => {
  const { screenId, sessionId } = useParams<{ screenId: string; sessionId?: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();

  // External stores
  const { getScreenById, initializeScreens, screens } = useScreensStore();
  const { contexts } = useContextStore();

  // Vibe store
  const {
    currentSession,
    sourceMetadata,
    plan,
    variants,
    messages,
    status,
    progress,
    error,
    selectedVariantIndex,
    previewVariantIndex,
    previewTab,
    initSession,
    setSession,
    clearSession,
    setSourceMetadata,
    setAnalyzing,
    setPlan,
    updatePlanItem,
    approvePlan: storeApprovePlan,
    setVariants,
    setStatus,
    setProgress,
    setError,
    selectVariant: storeSelectVariant,
    setPreviewVariant,
    setPreviewTab,
    addMessage,
    updateMessage,
    getPlanByIndex,
    getVariantByIndex,
  } = useVibeStore();

  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState<ReturnType<typeof getScreenById> | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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

                // Auto-select the first completed variant tab, or the selected one
                const completedVariant = existingVariants.find((v) => v.status === 'complete');
                if (session.selected_variant_index) {
                  setPreviewTab(session.selected_variant_index as 1 | 2 | 3 | 4);
                } else if (completedVariant) {
                  setPreviewTab(completedVariant.variant_index as 1 | 2 | 3 | 4);
                }
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

  // Handle chat message submission
  const handleSendMessage = useCallback(
    async (prompt: string) => {
      if (!screen?.editedHtml || !screenId) return;

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

        // Re-add user message after init (which clears messages)
        addChatMessage('user', prompt);

        // Update URL with session ID
        navigate(`/prototypes/${screenId}/${session.id}`, { replace: true });

        // Add analyzing message
        const analyzingMsgId = addChatMessage(
          'assistant',
          'Analyzing the screen design...',
          'pending'
        );

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

        // Update analyzing message
        updateMessage(analyzingMsgId, {
          content: 'Screen analysis complete. Now designing 4 variant concepts...',
          status: 'complete',
        });

        // Add planning message
        const planningMsgId = addChatMessage(
          'assistant',
          'AI is designing 4 different approaches based on your prompt...',
          'pending'
        );

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

        // Update planning message
        updateMessage(planningMsgId, {
          content: `Here are 4 variant concepts:\n\n${result.plans
            .map((p, i) => `${i + 1}. **${p.title}**: ${p.description}`)
            .join('\n\n')}\n\nReview and approve to generate the code.`,
          status: 'complete',
        });

        // Expand plans section
        setExpandedSections(['plans']);
      } catch (err) {
        console.error('Error generating plan:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate plan';
        setError(errorMsg);
        addChatMessage('assistant', `Error: ${errorMsg}`, 'error');
        showError('Failed to generate variant plan');
      }
    },
    [screen, screenId, sourceMetadata, contexts]
  );

  // Handle plan approval
  const handleApprovePlan = useCallback(async () => {
    if (!currentSession?.id || !plan || !screen?.editedHtml) return;

    try {
      // Approve plan in database
      const session = await approvePlan(currentSession.id);
      if (session) {
        storeApprovePlan();
      }

      // Add generating message
      const generatingMsgId = addChatMessage(
        'assistant',
        'Starting code generation for all 4 variants...',
        'pending'
      );

      // Start generating variants
      setStatus('generating');
      setProgress({
        stage: 'generating',
        message: 'Starting code generation...',
        percent: 0,
      });

      // Generate all variants sequentially
      const generatedVariants = await generateAllVariants(
        currentSession.id,
        plan.plans,
        screen.editedHtml,
        sourceMetadata || undefined,
        undefined,
        (p) => {
          setProgress({
            stage: 'generating',
            message: p.message,
            percent: p.percent,
            variantIndex: p.variantIndex,
            variantTitle: p.title,
          });

          // Update message with progress
          updateMessage(generatingMsgId, {
            content: `Generating variants...\n\n${p.message}`,
          });

          // Update individual variant in store as it completes
          if (p.stage === 'complete') {
            getVariants(currentSession.id).then(setVariants);

            // Auto-switch to completed variant tab
            if (p.variantIndex) {
              setPreviewTab(p.variantIndex as SelectedTab);
            }
          }
        }
      );

      setVariants(generatedVariants);
      setStatus('complete');
      setProgress(null);

      // Update final message
      updateMessage(generatingMsgId, {
        content:
          'All 4 variants have been generated! Use the tabs below the preview to switch between them, and click to select a winner.',
        status: 'complete',
      });

      // Collapse plans section
      setExpandedSections([]);

      showSuccess('All variants generated successfully!');
    } catch (err) {
      console.error('Error generating variants:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate variants';
      setError(errorMsg);
      addChatMessage('assistant', `Error generating variants: ${errorMsg}`, 'error');
      showError('Failed to generate variant code');
    }
  }, [currentSession, plan, screen, sourceMetadata]);

  // Handle plan item update
  const handleUpdatePlan = useCallback(
    async (variantIndex: number, updates: Partial<VariantPlan>) => {
      const planItem = getPlanByIndex(variantIndex);
      if (!planItem) return;

      try {
        await updateVariantPlan(planItem.id, updates);
        updatePlanItem(variantIndex, updates);
      } catch (err) {
        console.error('Error updating plan:', err);
        showError('Failed to update plan');
      }
    },
    [getPlanByIndex]
  );

  // Handle regenerate plan
  const handleRegeneratePlan = useCallback(() => {
    setStatus('idle');
    setPlan(null as unknown as { plans: VariantPlan[]; model: string; provider: string });
    addChatMessage('system', 'Plan cleared. Enter a new prompt to generate variants.');
  }, []);

  // Handle variant selection
  const handleSelectVariant = useCallback(
    async (index: number) => {
      if (!currentSession?.id) return;

      try {
        await selectVariant(currentSession.id, index);
        storeSelectVariant(index);
        addChatMessage(
          'assistant',
          `Variant ${index} has been selected as the winner! You can now apply it to your screen.`,
          'complete',
          { variantIndex: index }
        );
        showSuccess(`Variant ${index} selected as winner!`);
      } catch (err) {
        console.error('Error selecting variant:', err);
        showError('Failed to select variant');
      }
    },
    [currentSession]
  );

  // Handle tab change
  const handleTabChange = useCallback(
    (tab: SelectedTab) => {
      setPreviewTab(tab);
    },
    [setPreviewTab]
  );

  // Handle section expansion
  const handleSectionChange = (section: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections((prev) =>
      isExpanded ? [...prev, section] : prev.filter((s) => s !== section)
    );
  };

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

  // Preview modal variant
  const previewPlan = previewVariantIndex ? getPlanByIndex(previewVariantIndex) : null;
  const previewVariant = previewVariantIndex ? getVariantByIndex(previewVariantIndex) : null;

  // Status chip
  const getStatusChip = () => {
    switch (status) {
      case 'analyzing':
        return <Chip label="Analyzing" color="primary" size="small" />;
      case 'planning':
        return <Chip label="Planning" color="primary" size="small" />;
      case 'plan_ready':
        return <Chip label="Review Plan" color="warning" size="small" />;
      case 'generating':
        return <Chip label="Generating" color="primary" size="small" />;
      case 'complete':
        return <Chip label="Complete" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label="Ready" size="small" variant="outlined" />;
    }
  };

  // Check if chat is active
  const isChatActive = status === 'idle' || status === 'complete';
  const isGenerating = status === 'analyzing' || status === 'planning' || status === 'generating';

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          py: 1.5,
          px: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/repository/screens')}
          >
            Back
          </Button>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BoltIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ mb: 0 }}>
                Vibe Prototyping
              </Typography>
              {getStatusChip()}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {screen.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ModelSelector size="small" />
          {selectedVariantIndex && (
            <Chip
              label={`Winner: Variant ${selectedVariantIndex}`}
              color="warning"
              icon={<CheckCircleIcon />}
            />
          )}
          <IconButton>
            <SettingsOutlinedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mx: 3, mt: 1 }}
        >
          {error}
        </Alert>
      )}

      {/* Variant Plans Section - Prominent when plans are ready */}
      {status === 'plan_ready' && plan && (
        <Box
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'warning.lighter',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AppsIcon sx={{ color: 'warning.main' }} />
              <Typography fontWeight={600}>Review Variant Plans</Typography>
              <Badge badgeContent={plan.plans.length} color="primary" />
              <Chip label="Awaiting Approval" color="warning" size="small" />
            </Box>
            <Button
              variant="contained"
              onClick={handleApprovePlan}
              startIcon={<BoltIcon />}
            >
              Approve & Generate All
            </Button>
          </Box>
          <PlanReviewGrid
            plans={plan.plans}
            onUpdatePlan={handleUpdatePlan}
            onApprove={handleApprovePlan}
            onRegenerate={handleRegeneratePlan}
            isApproved={false}
            modelInfo={{ model: plan.model, provider: plan.provider }}
            compact
          />
        </Box>
      )}

      {/* Main Content - Split Panel */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left - Screen Preview */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
            <ScreenPreview
              sourceHtml={screen.editedHtml || null}
              variants={variants}
              selectedTab={previewTab}
              onTabChange={handleTabChange}
              selectedVariantIndex={selectedVariantIndex}
              onExpandPreview={
                previewTab !== 'source' && getVariantByIndex(previewTab as number)
                  ? () => setPreviewVariant(previewTab as number)
                  : undefined
              }
              isGenerating={isGenerating}
              currentGeneratingIndex={progress?.variantIndex}
            />
          </Box>
        </Box>

        {/* Right - Chat Panel */}
        <Box
          sx={{
            width: 400,
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isGenerating}
              disabled={!isChatActive && !isGenerating}
              placeholder={
                status === 'plan_ready'
                  ? 'Approve the plan first to generate variants'
                  : 'Describe your design changes...'
              }
            />
          </Box>
        </Box>
      </Box>

      {/* Bottom - Expandable Sections */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        {/* Variant Plans - Only show in collapsed section after approval */}
        {plan && status !== 'plan_ready' && (
          <Accordion
            expanded={expandedSections.includes('plans')}
            onChange={handleSectionChange('plans')}
            disableGutters
            sx={{ '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AppsIcon />
                <Typography>Variant Plans</Typography>
                <Badge badgeContent={plan.plans.length} color="primary" />
                {currentSession?.plan_approved && (
                  <Chip label="Approved" color="success" size="small" icon={<CheckCircleIcon />} />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ py: 1 }}>
              <PlanReviewGrid
                plans={plan.plans}
                onUpdatePlan={handleUpdatePlan}
                onApprove={handleApprovePlan}
                onRegenerate={handleRegeneratePlan}
                isApproved={currentSession?.plan_approved}
                modelInfo={{ model: plan.model, provider: plan.provider }}
                compact
              />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Source Analysis */}
        <Accordion
          expanded={expandedSections.includes('analysis')}
          onChange={handleSectionChange('analysis')}
          disableGutters
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FindInPageIcon />
              <Typography>Source Analysis</Typography>
              {sourceMetadata && (
                <Chip
                  label={`${sourceMetadata.components.length} components`}
                  color="success"
                  size="small"
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 1, maxHeight: 300, overflow: 'auto' }}>
            <SourceAnalysisPanel
              sourceHtml={screen.editedHtml || null}
              metadata={sourceMetadata}
              isAnalyzing={status === 'analyzing'}
              analysisMessage={progress?.message}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Preview Modal */}
      <VariantPreviewModal
        open={previewVariantIndex !== null}
        onClose={() => setPreviewVariant(null)}
        variant={previewVariant || null}
        plan={previewPlan || null}
        onSelect={() => previewVariantIndex && handleSelectVariant(previewVariantIndex)}
        isSelected={selectedVariantIndex === previewVariantIndex}
      />
    </Box>
  );
};

export default VibePrototyping;
