import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: FileList) => void;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export function FileUpload({
  accept,
  multiple = false,
  onFilesSelected,
  title = 'Click or drag files here',
  description,
  disabled = false,
}: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && e.dataTransfer.files.length > 0) {
        onFilesSelected(e.dataTransfer.files);
      }
    },
    [disabled, onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept || '';
    input.multiple = multiple;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
    };
    input.click();
  }, [accept, disabled, multiple, onFilesSelected]);

  return (
    <Box
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      sx={{
        border: '2px dashed',
        borderColor: disabled ? 'grey.300' : 'grey.400',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: disabled ? 'grey.100' : 'transparent',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: disabled ? 'grey.300' : 'primary.main',
          backgroundColor: disabled ? 'grey.100' : 'primary.50',
        },
      }}
    >
      <CloudUploadIcon
        sx={{ fontSize: 48, color: disabled ? 'grey.400' : 'grey.500', mb: 2 }}
      />
      <Typography variant="body1" color={disabled ? 'text.disabled' : 'text.primary'}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
