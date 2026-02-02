import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FlagIcon from '@mui/icons-material/Flag';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Button, Card, CardContent, Chip } from '@/components/ui';
import { useSnackbar } from '@/components/SnackbarProvider';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useContextStore } from '@/store/contextStore';
import {
  extractUXGuidelines,
  extractGuidelinesDemo,
  createGuidelinesSet,
  type ExtractionProgress,
} from '@/services/uxGuidelinesService';
import type { UXGuidelineCategory } from '@/types/models';
import {
  getContextFiles,
  uploadContextFile,
  deleteContextFile,
  getFileDownloadUrl,
  formatFileSize,
  type ContextFile,
  type ContextCategory as ContextCategoryType,
} from '@/services/contextFilesService';

interface CategoryConfig {
  id: ContextCategoryType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const categoryConfigs: CategoryConfig[] = [
  {
    id: 'goals',
    title: 'Goals / OKRs / Mission',
    description: 'Company objectives and key results',
    icon: <FlagIcon />,
    color: '#764ba2',
  },
  {
    id: 'kpis',
    title: 'KPIs',
    description: 'Key performance indicators and metrics',
    icon: <TrendingUpOutlinedIcon />,
    color: '#52c41a',
  },
  {
    id: 'backlog',
    title: 'Backlog / Opportunities',
    description: 'Product backlog and feature ideas',
    icon: <ListAltIcon />,
    color: '#faad14',
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    description: 'Documentation and reference materials',
    icon: <MenuBookIcon />,
    color: '#667eea',
  },
];

// Supported file types for upload
const SUPPORTED_FILE_TYPES = [
  '.pdf', '.doc', '.docx', '.txt', '.rtf', '.md',  // Documents
  '.xls', '.xlsx', '.csv',                          // Spreadsheets
  '.ppt', '.pptx', '.key',                          // Presentations
  '.mp4', '.mov', '.avi', '.webm', '.mkv',          // Video
  '.mp3', '.wav', '.ogg', '.m4a', '.aac',           // Audio
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', // Images
  '.json', '.xml',                                  // Data
].join(',');

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'image':
      return <ImageOutlinedIcon />;
    case 'video':
      return <VideocamOutlinedIcon />;
    case 'audio':
      return <AudiotrackOutlinedIcon />;
    case 'pdf':
      return <PictureAsPdfOutlinedIcon />;
    case 'document':
      return <DescriptionOutlinedIcon />;
    case 'spreadsheet':
      return <TableChartOutlinedIcon />;
    case 'presentation':
      return <SlideshowOutlinedIcon />;
    case 'text':
      return <TextSnippetOutlinedIcon />;
    default:
      return <InsertDriveFileOutlinedIcon />;
  }
}

interface FilePreviewProps {
  file: ContextFile;
  onDelete: () => void;
  onOpen: () => void;
  color: string;
}

function FilePreview({ file, onDelete, onOpen, color }: FilePreviewProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        backgroundColor: 'rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.06)',
          transform: 'translateX(4px)',
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          backgroundColor: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {getFileIcon(file.fileType)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatFileSize(file.fileSize)}
        </Typography>
      </Box>
      <Tooltip title="Open">
        <IconButton
          size="small"
          onClick={onOpen}
          sx={{ transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.1)' } }}
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={onDelete}
          color="error"
          sx={{ transition: 'all 0.2s ease', '&:hover': { transform: 'scale(1.1)' } }}
        >
          <DeleteOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

interface CategoryCardProps {
  config: CategoryConfig;
  files: ContextFile[];
  onUpload: (category: ContextCategoryType, file: File) => void;
  onDeleteFile: (file: ContextFile) => void;
  onOpenFile: (file: ContextFile) => void;
  uploading: boolean;
}

function CategoryCard({ config, files, onUpload, onDeleteFile, onOpenFile, uploading }: CategoryCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        onUpload(config.id, droppedFiles[0]);
      }
    },
    [config.id, onUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      onUpload(config.id, selectedFiles[0]);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isDragging ? `2px dashed ${config.color}` : '2px solid transparent',
        backgroundColor: isDragging ? `${config.color}08` : undefined,
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${config.color}15`,
              color: config.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              '& svg': { fontSize: 24 },
            }}
          >
            {config.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {config.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.description}
            </Typography>
          </Box>
          <Chip
            label={`${files.length} files`}
            size="small"
            sx={{
              backgroundColor: `${config.color}15`,
              color: config.color,
              fontWeight: 500,
            }}
          />
        </Box>

        {uploading && <LinearProgress sx={{ mb: 2 }} />}

        {/* File List */}
        <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
          {files.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                Drop files here or click to upload
              </Typography>
              <Typography variant="caption" color="text.disabled" align="center" sx={{ mt: 0.5 }}>
                PDF, Docs, Sheets, Videos, Audio
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {files.slice(0, 3).map((file) => (
                <FilePreview
                  key={file.id}
                  file={file}
                  color={config.color}
                  onDelete={() => onDeleteFile(file)}
                  onOpen={() => onOpenFile(file)}
                />
              ))}
              {files.length > 3 && (
                <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                  +{files.length - 3} more files
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileSelect}
          accept={SUPPORTED_FILE_TYPES}
        />
        <Button
          variant="outlined"
          startIcon={<AddOutlinedIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          sx={{
            borderColor: config.color,
            color: config.color,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: config.color,
              backgroundColor: `${config.color}10`,
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${config.color}30`,
            },
          }}
        >
          Upload File
        </Button>
      </CardContent>
    </Card>
  );
}

// Category labels for UX guidelines
const guidelineCategoryLabels: Record<UXGuidelineCategory, string> = {
  navigation: 'Navigation',
  interaction: 'Interaction',
  feedback: 'Feedback',
  layout: 'Layout',
  content: 'Content',
  accessibility: 'Accessibility',
  flow: 'User Flows',
};

const guidelineCategoryColors: Record<UXGuidelineCategory, string> = {
  navigation: '#1890ff',
  interaction: '#52c41a',
  feedback: '#faad14',
  layout: '#722ed1',
  content: '#13c2c2',
  accessibility: '#eb2f96',
  flow: '#f5222d',
};

export function Context() {
  const { showSuccess, showError } = useSnackbar();
  const [files, setFiles] = useState<Record<ContextCategoryType, ContextFile[]>>({
    goals: [],
    kpis: [],
    backlog: [],
    knowledge: [],
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<ContextCategoryType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ContextFile | null>(null);

  // UX Guidelines state
  const {
    uxGuidelinesSet,
    uxGuidelinesEnabled,
    setUXGuidelines,
    clearUXGuidelines,
    toggleUXGuidelinesEnabled,
    deleteUXGuideline,
  } = useContextStore();
  const [extracting, setExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress | null>(null);
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(true);
  const [guidelinesVideo, setGuidelinesVideo] = useState<File | null>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [videoTranscript, setVideoTranscript] = useState('');
  const [showTranscriptInput, setShowTranscriptInput] = useState(false);
  const guidelinesVideoInputRef = useRef<HTMLInputElement>(null);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const allFiles = await getContextFiles();

      // Group files by category
      const grouped: Record<ContextCategoryType, ContextFile[]> = {
        goals: [],
        kpis: [],
        backlog: [],
        knowledge: [],
      };

      allFiles.forEach((file) => {
        if (grouped[file.category]) {
          grouped[file.category].push(file);
        }
      });

      setFiles(grouped);
    } catch (error) {
      console.error('Failed to load files:', error);
      showError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (category: ContextCategoryType, file: File) => {
    try {
      setUploading(category);

      const uploadedFile = await uploadContextFile({
        category,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for title
        file,
      });

      setFiles((prev) => ({
        ...prev,
        [category]: [uploadedFile, ...prev[category]],
      }));

      showSuccess('File uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      showError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      await deleteContextFile(fileToDelete.id);

      setFiles((prev) => ({
        ...prev,
        [fileToDelete.category]: prev[fileToDelete.category].filter(
          (f) => f.id !== fileToDelete.id
        ),
      }));

      showSuccess('File deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      showError(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
    }
  };

  const handleOpenFile = async (file: ContextFile) => {
    try {
      const url = await getFileDownloadUrl(file.filePath);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get download URL:', error);
      showError('Failed to open file');
    }
  };

  // Handle video upload for guidelines
  const handleGuidelinesVideoSelect = (file: File) => {
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime'];
    if (!videoTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|webm|mkv)$/i)) {
      showError('Please upload a video file (MP4, MOV, AVI, WebM)');
      return;
    }
    setGuidelinesVideo(file);
    showSuccess(`Video "${file.name}" ready for analysis`);
  };

  const handleGuidelinesVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVideo(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleGuidelinesVideoSelect(droppedFiles[0]);
    }
  }, []);

  // Extract UX guidelines - uses real service with transcript, or demo mode
  const handleExtractGuidelines = async (useDemo = false) => {
    try {
      setExtracting(true);
      setExtractionProgress({ stage: 'preparing', message: 'Preparing...', percent: 0 });

      const videoName = guidelinesVideo?.name || 'Product Demo';

      let result;

      if (useDemo || !videoTranscript.trim()) {
        // Demo mode - no transcript available
        result = await extractGuidelinesDemo(
          videoName,
          (progress) => setExtractionProgress(progress)
        );
      } else {
        // Real extraction with transcript
        result = await extractUXGuidelines(
          videoName,
          videoTranscript.trim(),
          guidelinesVideo ? `Product demo video: ${videoName}` : undefined,
          undefined, // provider
          undefined, // model
          (progress) => setExtractionProgress(progress)
        );
      }

      // Create and store guidelines set
      const guidelinesSet = createGuidelinesSet(
        videoName.replace(/\.[^/.]+$/, '') || 'Product UX Guidelines',
        result,
        undefined,
        videoName
      );

      setUXGuidelines(guidelinesSet);
      setShowTranscriptInput(false);
      setVideoTranscript('');
      showSuccess(`Extracted ${result.guidelines.length} UX guidelines`);
    } catch (error) {
      console.error('Failed to extract guidelines:', error);
      showError(error instanceof Error ? error.message : 'Failed to extract guidelines');
    } finally {
      setExtracting(false);
      setExtractionProgress(null);
    }
  };

  const totalFiles = Object.values(files).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Product Context"
        subtitle={`${totalFiles} files across ${categoryConfigs.length} categories`}
      />

      {/* Info Alert */}
      <Alert severity="info" icon={<LightbulbIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> Upload product context files to help AI generate better,
          more relevant prototypes. Drag and drop files into any category.
        </Typography>
      </Alert>

      {/* 2x2 Category Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {categoryConfigs.map((config, index) => (
            <Grid
              item
              xs={12}
              md={6}
              key={config.id}
              sx={{
                animation: 'fadeInUp 0.4s ease forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                '@keyframes fadeInUp': {
                  from: { opacity: 0, transform: 'translateY(20px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <CategoryCard
                config={config}
                files={files[config.id]}
                onUpload={handleUpload}
                onDeleteFile={(file) => {
                  setFileToDelete(file);
                  setDeleteConfirmOpen(true);
                }}
                onOpenFile={handleOpenFile}
                uploading={uploading === config.id}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* UX Guidelines Section */}
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 3 }} />
        <Card
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            },
          }}
        >
          <CardContent>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <AutoAwesomeIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    UX Guidelines
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Extract patterns from product videos to guide AI prototyping
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {uxGuidelinesSet && (
                  <>
                    <Tooltip title={uxGuidelinesEnabled ? 'Disable guidelines' : 'Enable guidelines'}>
                      <Switch
                        checked={uxGuidelinesEnabled}
                        onChange={toggleUXGuidelinesEnabled}
                        color="primary"
                      />
                    </Tooltip>
                    <IconButton
                      onClick={() => setGuidelinesExpanded(!guidelinesExpanded)}
                      size="small"
                    >
                      {guidelinesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>

            {/* Extract Button or Guidelines Display */}
            {!uxGuidelinesSet ? (
              <Box sx={{ py: 2 }}>
                {extracting ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={extractionProgress?.percent || 0}
                      sx={{ mb: 2, borderRadius: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {extractionProgress?.message || 'Extracting...'}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Video Upload Area */}
                    <input
                      ref={guidelinesVideoInputRef}
                      type="file"
                      hidden
                      accept=".mp4,.mov,.avi,.webm,.mkv,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleGuidelinesVideoSelect(file);
                        e.target.value = '';
                      }}
                    />
                    <Box
                      onDragEnter={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDraggingVideo(false); }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleGuidelinesVideoDrop}
                      onClick={() => !guidelinesVideo && guidelinesVideoInputRef.current?.click()}
                      sx={{
                        border: '2px dashed',
                        borderColor: isDraggingVideo ? '#667eea' : guidelinesVideo ? '#52c41a' : 'divider',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: guidelinesVideo ? 'default' : 'pointer',
                        backgroundColor: isDraggingVideo ? 'rgba(102, 126, 234, 0.05)' : guidelinesVideo ? 'rgba(82, 196, 26, 0.05)' : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': !guidelinesVideo ? {
                          borderColor: '#667eea',
                          backgroundColor: 'rgba(102, 126, 234, 0.03)',
                        } : {},
                      }}
                    >
                      {guidelinesVideo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              backgroundColor: 'rgba(82, 196, 26, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#52c41a',
                            }}
                          >
                            <VideocamOutlinedIcon />
                          </Box>
                          <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {guidelinesVideo.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(guidelinesVideo.size / (1024 * 1024)).toFixed(1)} MB
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGuidelinesVideo(null);
                            }}
                            sx={{ ml: 1 }}
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Drop a product demo video here or click to upload
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            MP4, MOV, AVI, WebM supported
                          </Typography>
                        </>
                      )}
                    </Box>

                    {/* Transcript Input (when video uploaded) */}
                    {guidelinesVideo && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Automatic transcription coming soon!</strong> For now, paste the video transcript below,
                            or use demo mode to see sample guidelines.
                          </Typography>
                        </Alert>

                        {showTranscriptInput ? (
                          <Box>
                            <textarea
                              placeholder="Paste your video transcript here... (e.g., from YouTube captions, Rev.com, or any transcription service)"
                              value={videoTranscript}
                              onChange={(e) => setVideoTranscript(e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: 120,
                                padding: 12,
                                borderRadius: 8,
                                border: '1px solid #e0e0e0',
                                fontFamily: 'inherit',
                                fontSize: 14,
                                resize: 'vertical',
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {videoTranscript.length > 0 ? `${videoTranscript.length} characters` : 'Paste transcript from your video'}
                            </Typography>
                          </Box>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setShowTranscriptInput(true)}
                            sx={{ mb: 1 }}
                          >
                            Add Transcript Manually
                          </Button>
                        )}
                      </Box>
                    )}

                    {/* Extract Buttons */}
                    <Box sx={{ textAlign: 'center', mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {guidelinesVideo && videoTranscript.trim() && (
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleExtractGuidelines(false)}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                            },
                          }}
                        >
                          Extract from Transcript
                        </Button>
                      )}
                      <Button
                        variant={guidelinesVideo && videoTranscript.trim() ? 'outlined' : 'contained'}
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleExtractGuidelines(true)}
                        sx={guidelinesVideo && videoTranscript.trim() ? {} : {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                          },
                        }}
                      >
                        {guidelinesVideo ? 'Use Demo Guidelines' : 'Try Demo Extraction'}
                      </Button>
                    </Box>
                    {!guidelinesVideo && (
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                        No video? Try demo mode to see sample guidelines
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            ) : (
              <Collapse in={guidelinesExpanded}>
                <Box sx={{ mt: 2 }}>
                  {/* Guidelines Info */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: uxGuidelinesEnabled ? 'rgba(102, 126, 234, 0.08)' : 'rgba(0,0,0,0.03)',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {uxGuidelinesSet.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {uxGuidelinesSet.guidelines.length} guidelines •{' '}
                        {uxGuidelinesEnabled ? 'Active in prototyping' : 'Disabled'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleExtractGuidelines()}
                        disabled={extracting}
                      >
                        Re-extract
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={clearUXGuidelines}
                      >
                        Clear
                      </Button>
                    </Box>
                  </Box>

                  {/* Guidelines List */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {uxGuidelinesSet.guidelines.map((guideline) => (
                      <Box
                        key={guideline.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: 'rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.04)',
                          },
                        }}
                      >
                        <Chip
                          label={guidelineCategoryLabels[guideline.category]}
                          size="small"
                          sx={{
                            backgroundColor: `${guidelineCategoryColors[guideline.category]}15`,
                            color: guidelineCategoryColors[guideline.category],
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: 22,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {guideline.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {guideline.description}
                          </Typography>
                          {guideline.examples && guideline.examples.length > 0 && (
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
                              color="text.secondary"
                            >
                              e.g., {guideline.examples.slice(0, 2).join(', ')}
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => deleteUXGuideline(guideline.id)}
                          sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteFile}
        title="Delete File"
        content={`Are you sure you want to delete "${fileToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
