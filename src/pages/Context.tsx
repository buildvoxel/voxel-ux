import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
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
import { useSnackbar } from '@/components/SnackbarProvider';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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

  const totalFiles = Object.values(files).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
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
