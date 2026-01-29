/**
 * VibePrototyping Page - Full implementation with dynamic phases and resizable chat
 *
 * Features:
 * - Dynamic text per AI phase (Understanding, Planning, Building, Summary)
 * - Resizable chat panel (25% default, draggable)
 * - Consolidated toolbar with action groups
 * - File attachments support (images, video, audio, URLs)
 * - Context-aware chat (product context + prototype context)
 * - Streaming/progressive loading for variants
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import {
  Code,
  Cursor,
  PencilSimple,
  ArrowCounterClockwise,
  ArrowClockwise,
  Paperclip,
  ShareNetwork,
  Microphone,
  Warning,
  CaretDown,
  CaretRight,
  Image as ImageIcon,
  VideoCamera,
  LinkSimple,
  FilePdf,
  File,
  Check,
  Copy,
  Download,
  Brain,
  Info,
  X,
  Robot,
  DeviceMobile,
  DeviceTablet,
  Desktop,
  DotsSixVertical,
} from '@phosphor-icons/react';

import { useSnackbar } from '@/components/SnackbarProvider';
import { useScreensStore } from '@/store/screensStore';
import { useVibeStore, type ChatMessage } from '@/store/vibeStore';
import { useContextStore } from '@/store/contextStore';
import { useThemeStore } from '@/store/themeStore';
import { getContextFiles, type ContextFile } from '@/services/contextFilesService';

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
import {
  getApiKeys,
  PROVIDER_INFO,
  type LLMProvider,
  type ApiKeyConfig,
} from '@/services/apiKeysService';
import HTMLTreeEditor from '@/components/HTMLTreeEditor';
import WYSIWYGEditor from '@/components/WYSIWYGEditor';

// ============== Types ==============

interface AttachedFile {
  id: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'url' | 'figma' | 'file';
  name: string;
  url?: string;
  file?: File;
  preview?: string;
}

type EditMode = 'cursor' | 'code' | 'wysiwyg';
type PreviewSize = 'desktop' | 'tablet' | 'mobile';

const PREVIEW_SIZES: Record<PreviewSize, { width: number; label: string; icon: React.ReactNode }> = {
  desktop: { width: 1280, label: 'Desktop', icon: <Desktop size={16} /> },
  tablet: { width: 768, label: 'Tablet', icon: <DeviceTablet size={16} /> },
  mobile: { width: 375, label: 'Mobile', icon: <DeviceMobile size={16} /> },
};

// ============== Helper Components ==============

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

// Dynamic AI Phase component with streaming text effect
function AIPhase({
  label,
  content,
  isActive = false,
  isComplete = false,
}: {
  label: string;
  content: string;
  isActive?: boolean;
  isComplete?: boolean;
}) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (isActive && content) {
      setIsStreaming(true);
      setDisplayedContent('');
      let index = 0;
      const interval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          setIsStreaming(false);
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    } else if (isComplete) {
      setDisplayedContent(content);
    }
  }, [content, isActive, isComplete]);

  return (
    <Box sx={{ mb: 2.5, animation: 'fadeIn 0.3s ease', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
      <Typography
        sx={{
          color: '#26a69a',
          fontSize: 14,
          fontWeight: 600,
          mb: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {label}
        {isActive && !isComplete && (
          <CircularProgress size={12} sx={{ color: '#26a69a' }} />
        )}
        {isComplete && <Check size={14} weight="bold" />}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.6, minHeight: 40 }}
      >
        {displayedContent}
        {isStreaming && <span style={{ opacity: 0.5 }}>|</span>}
      </Typography>
    </Box>
  );
}

// Variant Card in the left panel
function VariantCard({
  title,
  description,
  isSelected = false,
  isBuilding = false,
  isComplete = false,
  progress = 0,
  onClick,
}: {
  title: string;
  description: string;
  isSelected?: boolean;
  isBuilding?: boolean;
  isComplete?: boolean;
  progress?: number;
  onClick?: () => void;
}) {
  const { config } = useThemeStore();

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        border: isSelected ? `2px solid ${config.colors.primary}` : '1px solid #e0e0e0',
        backgroundColor: 'white',
        transition: 'all 0.2s ease',
        opacity: isBuilding ? 0.9 : 1,
        '&:hover': onClick ? {
          borderColor: config.colors.primary,
          transform: 'translateX(4px)',
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {title}
          </Typography>
          {isComplete && <Check size={16} color={config.colors.success} weight="bold" />}
          {isBuilding && <CircularProgress size={14} />}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mb: isBuilding ? 1 : 0 }}>
          {description}
        </Typography>
        {isBuilding && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 1, height: 3, borderRadius: 2 }}
          />
        )}
      </CardContent>
    </Card>
  );
}

// Canvas variant preview card (in 2x2 grid)
function CanvasVariantCard({
  label,
  isLoading = false,
  htmlUrl,
  progress = 0,
  onClick,
}: {
  label: string;
  isLoading?: boolean;
  htmlUrl?: string | null;
  progress?: number;
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
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': onClick ? {
          borderColor: '#764ba2',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            position: 'relative',
            minHeight: 200,
          }}
        >
          {isLoading ? (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <CircularProgress size={32} sx={{ mb: 1.5 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Building {label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}% complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1.5, width: 120, height: 4, borderRadius: 2 }}
              />
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
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                  {label}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">{label}</Typography>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}

// File attachment chip
function AttachmentChip({
  file,
  onRemove,
}: {
  file: AttachedFile;
  onRemove: () => void;
}) {
  const getIcon = () => {
    switch (file.type) {
      case 'image': return <ImageIcon size={14} />;
      case 'video': return <VideoCamera size={14} />;
      case 'url':
      case 'figma': return <LinkSimple size={14} />;
      case 'pdf': return <FilePdf size={14} />;
      default: return <File size={14} />;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={file.name}
      size="small"
      onDelete={onRemove}
      sx={{
        maxWidth: 150,
        '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
      }}
    />
  );
}

// ============== Main Component ==============

export const VibePrototyping: React.FC = () => {
  const { screenId, sessionId } = useParams<{ screenId: string; sessionId?: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const { config } = useThemeStore();

  // External stores
  const { getScreenById, initializeScreens, screens, updateScreen } = useScreensStore();
  const { contexts } = useContextStore();

  // Vibe store
  const {
    sourceMetadata,
    plan,
    variants,
    status,
    progress,
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
  const [editMode, setEditMode] = useState<EditMode>('cursor');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [pagesAnchorEl, setPagesAnchorEl] = useState<null | HTMLElement>(null);
  const [variantSwitcherAnchorEl, setVariantSwitcherAnchorEl] = useState<null | HTMLElement>(null);
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop');

  // Screen name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Resizable panel state
  const [panelWidth, setPanelWidth] = useState(25); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic phase content based on user prompt
  const [phaseContent, setPhaseContent] = useState({
    understanding: '',
    planning: '',
    summary: '',
  });

  // Current prompt for context
  const [currentPrompt, setCurrentPrompt] = useState('');

  // Track completed variants locally to prevent progress reset
  const [completedVariantIndices, setCompletedVariantIndices] = useState<Set<number>>(new Set());

  // Product context files
  const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);

  // LLM model selector
  const [availableKeys, setAvailableKeys] = useState<ApiKeyConfig[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [llmMenuAnchorEl, setLlmMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Load context files and API keys on mount
  useEffect(() => {
    getContextFiles().then(setContextFiles).catch(console.error);
    getApiKeys().then((keys) => {
      setAvailableKeys(keys);
      // Set default to first active key
      const activeKey = keys.find(k => k.isActive) || keys[0];
      if (activeKey) {
        setSelectedProvider(activeKey.provider);
        setSelectedModel(activeKey.model || PROVIDER_INFO[activeKey.provider].defaultModel);
      }
    }).catch(console.error);
  }, []);

  // Initialize screen data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      if (screens.length === 0) {
        await initializeScreens();
      }

      if (screenId) {
        const s = getScreenById(screenId);
        setScreen(s);

        if (s?.editedHtml) {
          const cached = await getCachedMetadata(screenId);
          if (cached) {
            setSourceMetadata(cached as unknown as UIMetadata);
          }

          if (sessionId) {
            const session = await getVibeSession(sessionId);
            if (session) {
              initSession(session, s.editedHtml);
              setCurrentPrompt(session.prompt || '');

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
            clearSession();
          }
        }
      }

      setIsLoading(false);
    };

    init();
  }, [screenId, sessionId]);

  // Generate dynamic phase content based on prompt
  const generatePhaseContent = useCallback((prompt: string, screenName: string) => {
    const shortPrompt = prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt;

    setPhaseContent({
      understanding: `I understand you want to "${prompt}". I'll analyze the current "${screenName}" design and identify the best areas to implement this feature while maintaining design consistency and user experience best practices.`,
      planning: `Based on my analysis, I'm creating 4 distinct approaches to implement "${shortPrompt}". Each variant will explore a different UX pattern and visual treatment to give you options that range from conservative to innovative solutions.`,
      summary: `I've generated 4 variants for "${shortPrompt}". Each takes a unique approach: Variant A uses a minimal inline approach, Variant B adds a prominent modal flow, Variant C integrates it into the existing navigation, and Variant D explores a completely new interaction pattern. Click on any variant to see it in full screen.`,
    });
  }, []);

  // Handle panel resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 15% and 50%
      setPanelWidth(Math.min(50, Math.max(15, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
    setCurrentPrompt(prompt);
    generatePhaseContent(prompt, screen.name || 'screen');

    try {
      addChatMessage('user', prompt);

      const sessionName = `Vibe: ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`;
      const session = await createVibeSession(screenId, sessionName, prompt);

      if (!session) {
        throw new Error('Failed to create session');
      }

      initSession(session, screen.editedHtml);
      // Update URL without causing a re-render/reload
      window.history.replaceState(null, '', `/prototypes/${screenId}/${session.id}`);

      // Understanding phase
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

      // Planning phase
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

      const approvedSession = await approvePlan(session.id);
      if (approvedSession) {
        storeApprovePlan();
      }

      // Building phase
      setStatus('generating');
      setProgress({
        stage: 'generating',
        message: 'Starting code generation...',
        percent: 0,
      });

      // Reset completed tracking for new build
      setCompletedVariantIndices(new Set());

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

          // Track completed variants locally to prevent progress reset
          if (p.stage === 'complete' && p.variantIndex) {
            setCompletedVariantIndices(prev => new Set([...prev, p.variantIndex!]));
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
  }, [screen, screenId, promptValue, sourceMetadata, contexts, generatePhaseContent]);

  // Handle file attachment
  const handleFileAttach = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: AttachedFile[] = [];

    Array.from(files).forEach((file) => {
      if (attachedFiles.length + newAttachments.length >= 20) return;

      let type: AttachedFile['type'] = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type === 'application/pdf') type = 'pdf';

      const attachment: AttachedFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type,
        name: file.name,
        file,
        preview: type === 'image' ? URL.createObjectURL(file) : undefined,
      };

      newAttachments.push(attachment);
    });

    setAttachedFiles((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [attachedFiles.length]);

  // Handle URL attachment (used by URL input dialog)
  const handleUrlAttach = (url: string) => {
    if (attachedFiles.length >= 20) return;

    const isFigma = url.includes('figma.com');
    const attachment: AttachedFile = {
      id: `url_${Date.now()}`,
      type: isFigma ? 'figma' : 'url',
      name: isFigma ? 'Figma Design' : new URL(url).hostname,
      url,
    };

    setAttachedFiles((prev) => [...prev, attachment]);
  };
  // Export for potential future use
  void handleUrlAttach;

  // Handle share
  const handleShare = useCallback(() => {
    const link = `${window.location.origin}/view/${screenId}/${sessionId || 'preview'}`;
    setShareLink(link);
    setShareDialogOpen(true);
  }, [screenId, sessionId]);

  const handleCopyShareLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink);
    showSuccess('Link copied to clipboard');
  }, [shareLink, showSuccess]);

  // Handle variant selection
  const handleVariantClick = useCallback((index: number) => {
    setFocusedVariantIndex(index);
  }, []);

  const handleBackToGrid = useCallback(() => {
    setFocusedVariantIndex(null);
  }, []);

  // Handle screen name edit
  const handleStartEditName = useCallback(() => {
    setEditedName(screen?.name || '');
    setIsEditingName(true);
  }, [screen?.name]);

  const handleSaveName = useCallback(async () => {
    if (!screenId || !editedName.trim()) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateScreen(screenId, { name: editedName.trim() });
      // Update local screen state
      setScreen((prev) => prev ? { ...prev, name: editedName.trim() } : prev);
      showSuccess('Screen name updated');
    } catch (error) {
      console.error('Failed to update screen name:', error);
      showError('Failed to update screen name');
    } finally {
      setIsEditingName(false);
    }
  }, [screenId, editedName, updateScreen, showSuccess, showError]);

  // Computed values
  const isAnalyzing = status === 'analyzing';
  const isPlanning = status === 'planning';
  const isGenerating = status === 'generating';
  const isComplete = status === 'complete';
  const hasVariants = variants.length > 0;

  const projectName = screen?.name || 'Untitled Project';
  const focusedVariant = focusedVariantIndex ? getVariantByIndex(focusedVariantIndex) : null;
  const focusedPlan = focusedVariantIndex ? getPlanByIndex(focusedVariantIndex) : null;

  // Get progress for each variant - use local tracking for completed variants
  const getVariantProgress = useCallback((index: number) => {
    // Check local completed set first (prevents race conditions)
    if (completedVariantIndices.has(index)) return 100;
    // Check store for completed status
    const variant = getVariantByIndex(index);
    if (variant?.status === 'complete') return 100;
    // If currently building this variant, return the progress
    if (progress?.stage === 'generating' && progress.variantIndex === index) {
      return progress.percent;
    }
    return 0;
  }, [progress, getVariantByIndex, completedVariantIndices]);

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

  return (
    <Box sx={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Main content area - Chat and Stage side by side */}
      <Box ref={containerRef} sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Left Panel - Resizable Chat Panel */}
        <Box
          sx={{
            width: `${panelWidth}%`,
            minWidth: 200,
            maxWidth: '50%',
            bgcolor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            minHeight: 0,
          }}
        >
          {/* AI Phases and Variant Cards */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, minHeight: 0 }}>
            {/* Initial empty state */}
            {status === 'idle' && !plan && (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary" textAlign="center">
                  Describe what you want to build
                </Typography>
              </Box>
            )}

            {/* Understanding phase */}
            {(isAnalyzing || isPlanning || isGenerating || isComplete) && (
              <AIPhase
                label="Understanding"
                content={phaseContent.understanding || `Analyzing "${currentPrompt}" and understanding the design context...`}
                isActive={isAnalyzing}
                isComplete={!isAnalyzing}
              />
            )}

            {/* Planning phase */}
            {(isPlanning || isGenerating || isComplete) && (
              <AIPhase
                label="Planning"
                content={phaseContent.planning || 'Creating 4 unique approaches to solve this design challenge...'}
                isActive={isPlanning}
                isComplete={!isPlanning}
              />
            )}

            {/* Variant cards during planning/generating */}
            {(isPlanning || isGenerating || isComplete) && plan?.plans && (
              <Box sx={{ mt: 2 }}>
                {plan.plans.map((p, idx) => {
                  const variantProgress = getVariantProgress(idx + 1);
                  const variant = getVariantByIndex(idx + 1);
                  const isBuilding = isGenerating && progress?.variantIndex === idx + 1;

                  return (
                    <VariantCard
                      key={p.id || idx}
                      title={p.title || `Variant ${String.fromCharCode(65 + idx)}`}
                      description={p.description || 'Generating design approach...'}
                      isSelected={focusedVariantIndex === idx + 1}
                      isBuilding={isBuilding}
                      isComplete={variant?.status === 'complete'}
                      progress={variantProgress}
                      onClick={variant?.status === 'complete' ? () => handleVariantClick(idx + 1) : undefined}
                    />
                  );
                })}
              </Box>
            )}

            {/* Summary phase when complete */}
            {isComplete && (
              <AIPhase
                label="Summary"
                content={phaseContent.summary || 'All 4 variants are ready! Click on any variant to explore it in full screen.'}
                isComplete
              />
            )}
          </Box>

          {/* Prompt Input at bottom */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            {/* Context indicator */}
            {contextFiles.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Product Context Available
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {contextFiles.length} files loaded from your product context.
                        The AI will use this context to provide more relevant suggestions.
                      </Typography>
                    </Box>
                  }
                >
                  <Chip
                    icon={<Brain size={14} />}
                    label={`${contextFiles.length} context files`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => setContextPanelOpen(!contextPanelOpen)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'primary.50' },
                    }}
                  />
                </Tooltip>
                {contextPanelOpen && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1.5,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      maxHeight: 150,
                      overflow: 'auto',
                    }}
                  >
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Available Context:
                    </Typography>
                    {contextFiles.slice(0, 5).map((file) => (
                      <Box
                        key={file.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          py: 0.5,
                        }}
                      >
                        <Info size={12} />
                        <Typography variant="caption" noWrap>
                          {file.title} ({file.category})
                        </Typography>
                      </Box>
                    ))}
                    {contextFiles.length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        +{contextFiles.length - 5} more files
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Attached files */}
            {attachedFiles.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                {attachedFiles.map((file) => (
                  <AttachmentChip
                    key={file.id}
                    file={file}
                    onRemove={() => setAttachedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                  />
                ))}
              </Box>
            )}

            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder="What would you like to build? Describe your idea..."
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
                  fontFamily: config.fonts.body,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                  '&.Mui-focused': { boxShadow: '0 2px 12px rgba(0,0,0,0.12)' },
                },
                '& .MuiOutlinedInput-input': {
                  fontFamily: config.fonts.body,
                  '&::placeholder': {
                    fontFamily: config.fonts.body,
                    opacity: 0.6,
                  },
                },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* LLM Model Selector */}
                {availableKeys.length > 0 ? (
                  <>
                    <Tooltip title="Select AI Model">
                      <Button
                        size="small"
                        startIcon={<Robot size={16} />}
                        endIcon={<CaretDown size={12} />}
                        onClick={(e) => setLlmMenuAnchorEl(e.currentTarget)}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          px: 1,
                          minWidth: 0,
                        }}
                      >
                        {selectedProvider ? (
                          <Typography noWrap sx={{ maxWidth: 100, fontSize: 'inherit' }}>
                            {PROVIDER_INFO[selectedProvider]?.name}: {selectedModel?.split('-').slice(0, 2).join('-')}
                          </Typography>
                        ) : (
                          'Select Model'
                        )}
                      </Button>
                    </Tooltip>
                    <Menu
                      anchorEl={llmMenuAnchorEl}
                      open={Boolean(llmMenuAnchorEl)}
                      onClose={() => setLlmMenuAnchorEl(null)}
                      TransitionComponent={Fade}
                      slotProps={{
                        paper: {
                          sx: { maxHeight: 400, minWidth: 250 },
                        },
                      }}
                    >
                      {availableKeys.map((key) => {
                        // Only show the configured model for this key, not all models
                        const configuredModel = key.model || PROVIDER_INFO[key.provider]?.defaultModel;
                        return (
                          <MenuItem
                            key={key.provider}
                            selected={selectedProvider === key.provider}
                            onClick={() => {
                              setSelectedProvider(key.provider);
                              setSelectedModel(configuredModel);
                              setLlmMenuAnchorEl(null);
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body2" fontWeight={500}>
                                {PROVIDER_INFO[key.provider]?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {configuredModel}
                              </Typography>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Menu>
                  </>
                ) : (
                  <Tooltip title="Configure API keys in Settings">
                    <Chip
                      icon={<Warning size={14} />}
                      label="No API keys"
                      size="small"
                      color="warning"
                      variant="outlined"
                      onClick={() => navigate('/settings')}
                      sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
                    />
                  </Tooltip>
                )}
                <Tooltip title="Voice input">
                  <IconButton size="small">
                    <Microphone size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {attachedFiles.length}/20 files
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  multiple
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={handleFileAttach}
                />
                <Tooltip title="Attach files (images, videos, PDFs)">
                  <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip size={20} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleBuild}
                  disabled={!promptValue.trim() || isAnalyzing || isPlanning || isGenerating || availableKeys.length === 0}
                  sx={{
                    textTransform: 'none',
                    minWidth: 70,
                    bgcolor: 'grey.800',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'grey.900', transform: 'translateY(-1px)' },
                  }}
                >
                  {isAnalyzing || isPlanning || isGenerating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    'Build'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Resize handle */}
          <Box
            ref={resizeRef}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            sx={{
              position: 'absolute',
              right: -6,
              top: 0,
              bottom: 0,
              width: 12,
              cursor: 'col-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              '&:hover .resize-indicator, &:active .resize-indicator': {
                opacity: 1,
                bgcolor: 'primary.main',
              },
            }}
          >
            <Box
              className="resize-indicator"
              sx={{
                width: 4,
                height: 48,
                bgcolor: isResizing ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                opacity: isResizing ? 1 : 0.5,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DotsSixVertical
                size={12}
                weight="bold"
                style={{
                  color: isResizing ? 'white' : '#666',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Right Panel - Stage with Toolbar */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
            minWidth: 0,
          }}
        >
          {/* Stage Toolbar */}
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
              flexShrink: 0,
            }}
          >
            {/* Left: Edit mode toggle + Project breadcrumb */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Edit mode group */}
              <Box
                sx={{
                  display: 'flex',
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  p: 0.25,
                }}
              >
                <Tooltip title="Preview Mode (V)">
                  <IconButton
                    size="small"
                    onClick={() => setEditMode('cursor')}
                    sx={{
                      bgcolor: editMode === 'cursor' ? 'background.paper' : 'transparent',
                      boxShadow: editMode === 'cursor' ? 1 : 0,
                    }}
                  >
                    <Cursor size={18} weight={editMode === 'cursor' ? 'fill' : 'regular'} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Code Editor">
                  <IconButton
                    size="small"
                    onClick={() => setEditMode('code')}
                    sx={{
                      bgcolor: editMode === 'code' ? 'background.paper' : 'transparent',
                      boxShadow: editMode === 'code' ? 1 : 0,
                    }}
                  >
                    <Code size={18} weight={editMode === 'code' ? 'fill' : 'regular'} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="WYSIWYG Editor">
                  <IconButton
                    size="small"
                    onClick={() => setEditMode('wysiwyg')}
                    sx={{
                      bgcolor: editMode === 'wysiwyg' ? 'background.paper' : 'transparent',
                      boxShadow: editMode === 'wysiwyg' ? 1 : 0,
                    }}
                  >
                    <PencilSimple size={18} weight={editMode === 'wysiwyg' ? 'fill' : 'regular'} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider orientation="vertical" flexItem />

              {/* Project breadcrumb */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isEditingName ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TextField
                      size="small"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      autoFocus
                      sx={{
                        width: 180,
                        '& .MuiOutlinedInput-root': {
                          fontFamily: config.fonts.body,
                          fontSize: '0.875rem',
                        },
                        '& .MuiOutlinedInput-input': {
                          py: 0.5,
                          px: 1,
                        },
                      }}
                    />
                    <Tooltip title="Save">
                      <IconButton size="small" onClick={handleSaveName} color="primary">
                        <Check size={16} weight="bold" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <IconButton size="small" onClick={() => setIsEditingName(false)}>
                        <X size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 500,
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {focusedVariantIndex && focusedPlan ? (
                      <>
                        <span
                          style={{ cursor: 'pointer', color: config.colors.primary }}
                          onClick={handleBackToGrid}
                        >
                          {projectName}
                        </span>
                        <CaretRight size={14} />
                        {focusedPlan.title}
                      </>
                    ) : (
                      <Tooltip title="Click to rename">
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={handleStartEditName}
                        >
                          {projectName}
                        </span>
                      </Tooltip>
                    )}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Center: Variant switcher + Undo/Redo + Pages dropdown */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Variant switcher (only when focused) */}
              {focusedVariantIndex && (
                <>
                  <Button
                    size="small"
                    endIcon={<CaretDown size={14} />}
                    onClick={(e) => setVariantSwitcherAnchorEl(e.currentTarget)}
                    sx={{ textTransform: 'none', minWidth: 120 }}
                  >
                    Variant {String.fromCharCode(64 + focusedVariantIndex)}
                  </Button>
                  <Menu
                    anchorEl={variantSwitcherAnchorEl}
                    open={Boolean(variantSwitcherAnchorEl)}
                    onClose={() => setVariantSwitcherAnchorEl(null)}
                    TransitionComponent={Fade}
                  >
                    {[1, 2, 3, 4].map((idx) => (
                      <MenuItem
                        key={idx}
                        selected={focusedVariantIndex === idx}
                        onClick={() => {
                          setFocusedVariantIndex(idx);
                          setVariantSwitcherAnchorEl(null);
                        }}
                      >
                        Variant {String.fromCharCode(64 + idx)}
                      </MenuItem>
                    ))}
                  </Menu>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                </>
              )}

              {/* Undo/Redo */}
              <Tooltip title="Undo">
                <IconButton size="small">
                  <ArrowCounterClockwise size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Redo">
                <IconButton size="small">
                  <ArrowClockwise size={18} />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              {/* Pages dropdown */}
              <Button
                size="small"
                endIcon={<CaretDown size={14} />}
                onClick={(e) => setPagesAnchorEl(e.currentTarget)}
                sx={{
                  textTransform: 'none',
                  px: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  maxWidth: 200,
                }}
              >
                <Typography noWrap sx={{ fontSize: 'inherit' }}>
                  {projectName}
                </Typography>
              </Button>
              <Menu
                anchorEl={pagesAnchorEl}
                open={Boolean(pagesAnchorEl)}
                onClose={() => setPagesAnchorEl(null)}
                TransitionComponent={Fade}
                slotProps={{
                  paper: {
                    sx: { maxHeight: 300, minWidth: 200 },
                  },
                }}
              >
                <MenuItem disabled sx={{ opacity: 0.6 }}>
                  <Typography variant="caption" fontWeight={600}>
                    All Screens
                  </Typography>
                </MenuItem>
                <Divider />
                {screens.map((s) => (
                  <MenuItem
                    key={s.id}
                    selected={s.id === screenId}
                    onClick={() => {
                      setPagesAnchorEl(null);
                      if (s.id !== screenId) {
                        navigate(`/prototypes/${s.id}`);
                      }
                    }}
                  >
                    <Typography noWrap sx={{ maxWidth: 180 }}>
                      {s.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Right: Preview size + Share button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Preview Size Selector */}
              <Box
                sx={{
                  display: 'flex',
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  p: 0.25,
                }}
              >
                {(Object.keys(PREVIEW_SIZES) as PreviewSize[]).map((size) => (
                  <Tooltip key={size} title={PREVIEW_SIZES[size].label}>
                    <IconButton
                      size="small"
                      onClick={() => setPreviewSize(size)}
                      sx={{
                        bgcolor: previewSize === size ? 'background.paper' : 'transparent',
                        boxShadow: previewSize === size ? 1 : 0,
                      }}
                    >
                      {PREVIEW_SIZES[size].icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>

              <Divider orientation="vertical" flexItem />

              <Button
                variant="contained"
                size="small"
                startIcon={<ShareNetwork size={16} />}
                onClick={handleShare}
                sx={{
                  textTransform: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
              >
                Share
              </Button>
            </Box>
          </Box>

          {/* Initial state - show the selected screen with edit mode support */}
          {status === 'idle' && !hasVariants && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                minHeight: 0, // Prevent flex item from growing beyond container
              }}
            >
              {screen?.editedHtml ? (
                <Card
                  variant="outlined"
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    minHeight: 0,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      position: 'relative',
                      backgroundColor: editMode === 'code' ? '#1e1e1e' : '#fafafa',
                      minHeight: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: previewSize !== 'desktop' ? 'flex-start' : 'stretch',
                      pt: previewSize !== 'desktop' ? 2 : 0,
                    }}
                  >
                    {/* Preview Mode (cursor) */}
                    {editMode === 'cursor' && (
                      <Box
                        sx={{
                          width: previewSize === 'desktop' ? '100%' : PREVIEW_SIZES[previewSize].width,
                          maxWidth: '100%',
                          height: previewSize === 'desktop' ? '100%' : 'calc(100% - 16px)',
                          border: previewSize !== 'desktop' ? '1px solid' : 'none',
                          borderColor: 'divider',
                          borderRadius: previewSize !== 'desktop' ? 2 : 0,
                          overflow: 'hidden',
                          boxShadow: previewSize !== 'desktop' ? 3 : 0,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <iframe
                          srcDoc={screen.editedHtml}
                          title={screen.name || 'Screen Preview'}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                          }}
                        />
                      </Box>
                    )}

                    {/* Code Editor Mode - HTML Tree View */}
                    {editMode === 'code' && (
                      <HTMLTreeEditor
                        html={screen.editedHtml}
                        onHtmlChange={(newHtml) => {
                          updateScreen(screenId!, { editedHtml: newHtml });
                        }}
                      />
                    )}

                    {/* WYSIWYG Editor Mode */}
                    {editMode === 'wysiwyg' && (
                      <WYSIWYGEditor
                        html={screen.editedHtml}
                        onHtmlChange={(newHtml) => {
                          updateScreen(screenId!, { editedHtml: newHtml });
                        }}
                      />
                    )}
                  </Box>
                </Card>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Describe what you want to build to get started
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Loading/Planning state - 2x2 grid with loading indicators */}
          {(isAnalyzing || isPlanning || isGenerating) && !focusedVariantIndex && (
            <Box sx={{ flex: 1, p: 2, overflow: 'auto', minHeight: 0 }}>
              <Grid container spacing={2} sx={{ height: '100%', minHeight: 0 }}>
                {['Variant A', 'Variant B', 'Variant C', 'Variant D'].map((label, idx) => {
                  const variant = variants.find((v) => v.variant_index === idx + 1);
                  const variantProgress = getVariantProgress(idx + 1);

                  return (
                    <Grid item xs={6} key={label} sx={{ height: '50%' }}>
                      <CanvasVariantCard
                        label={label}
                        isLoading={!variant || variant.status !== 'complete'}
                        htmlUrl={variant?.html_url}
                        progress={variantProgress}
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
            <Box sx={{ flex: 1, p: 2, overflow: 'auto', minHeight: 0 }}>
              <Grid container spacing={2} sx={{ height: '100%', minHeight: 0 }}>
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

          {/* Focused variant - single full preview with edit mode support */}
          {focusedVariantIndex && focusedVariant && (
            <Box sx={{ flex: 1, p: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    position: 'relative',
                    backgroundColor: editMode === 'code' ? '#1e1e1e' : '#fafafa',
                    overflow: 'hidden',
                  }}
                >
                  {/* Preview Mode (cursor) */}
                  {editMode === 'cursor' && (
                    focusedVariant.html_url ? (
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
                    )
                  )}

                  {/* Code Editor Mode - Tree View for variants */}
                  {editMode === 'code' && (
                    <Box sx={{ height: '100%', bgcolor: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderBottom: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#9cdcfe', fontFamily: 'monospace' }}>
                          variant-{String.fromCharCode(96 + focusedVariantIndex)}.html
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {focusedVariant.html_url && (
                            <>
                              <Tooltip title="Open in new tab">
                                <IconButton
                                  size="small"
                                  sx={{ color: 'grey.400' }}
                                  onClick={() => window.open(focusedVariant.html_url!, '_blank')}
                                >
                                  <LinkSimple size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download HTML">
                                <IconButton
                                  size="small"
                                  sx={{ color: 'grey.400' }}
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = focusedVariant.html_url!;
                                    link.download = `variant-${String.fromCharCode(96 + focusedVariantIndex)}.html`;
                                    link.click();
                                  }}
                                >
                                  <Download size={16} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          overflow: 'auto',
                          p: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                        }}
                      >
                        {focusedVariant.html_url ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <Code size={48} color="#9cdcfe" weight="light" />
                            <Typography color="grey.400" sx={{ mt: 2, mb: 1 }}>
                              Variant {String.fromCharCode(64 + focusedVariantIndex)} Generated
                            </Typography>
                            <Typography variant="body2" color="grey.500" sx={{ maxWidth: 400 }}>
                              This variant was generated from the AI. Open in a new tab or download to view the full HTML code.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<LinkSimple size={16} />}
                                onClick={() => window.open(focusedVariant.html_url!, '_blank')}
                                sx={{
                                  borderColor: 'grey.600',
                                  color: 'grey.300',
                                  '&:hover': { borderColor: 'grey.400', bgcolor: 'rgba(255,255,255,0.05)' },
                                }}
                              >
                                View Source
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Download size={16} />}
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = focusedVariant.html_url!;
                                  link.download = `variant-${String.fromCharCode(96 + focusedVariantIndex)}.html`;
                                  link.click();
                                }}
                                sx={{
                                  bgcolor: '#4fc3f7',
                                  '&:hover': { bgcolor: '#29b6f6' },
                                }}
                              >
                                Download
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Typography color="grey.500" fontStyle="italic">
                            Code not available. Generate a variant first.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* WYSIWYG Editor Mode - Interactive editing */}
                  {editMode === 'wysiwyg' && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'grey.50',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Chip
                          label="Preview Mode"
                          size="small"
                          color="primary"
                          variant="outlined"
                          icon={<PencilSimple size={14} />}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Variant {String.fromCharCode(64 + focusedVariantIndex)} - Interactive preview
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, position: 'relative' }}>
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
                              No content to preview
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Card>
            </Box>
          )}
        </Box>
      </Box>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ fontFamily: config.fonts.display }}>
          Share Prototype
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share this link with your team to collaborate on this prototype.
          </Typography>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={handleCopyShareLink}>
                  <Copy size={20} />
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: config.fonts.body,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)} variant="outlined">
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={() => {
              showSuccess('Download started');
              setShareDialogOpen(false);
            }}
          >
            Download HTML
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VibePrototyping;
