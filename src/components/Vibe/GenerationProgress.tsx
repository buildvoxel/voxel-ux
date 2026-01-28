/**
 * GenerationProgress - Progress bar with variant generation status
 */

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import { getVibeVariantColor, getVibeVariantLabel } from '../../store/vibeStore';
import type { VibeVariant } from '../../services/variantCodeService';
import type { VariantPlan } from '../../services/variantPlanService';

interface GenerationProgressProps {
  plans: VariantPlan[];
  variants: VibeVariant[];
  currentVariantIndex?: number;
  currentMessage?: string;
  overallPercent?: number;
  error?: string | null;
}

const getVariantIcon = (status: string | undefined) => {
  switch (status) {
    case 'complete':
      return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />;
    case 'generating':
    case 'capturing':
      return <CircularProgress size={18} />;
    case 'failed':
      return <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />;
    default:
      return <AccessTimeIcon sx={{ color: 'grey.400', fontSize: 20 }} />;
  }
};

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  plans,
  variants,
  currentVariantIndex,
  currentMessage,
  overallPercent = 0,
  error,
}) => {
  // Build variant status map
  const variantStatusMap = new Map(variants.map((v) => [v.variant_index, v]));

  // Calculate completed count
  const completedCount = variants.filter((v) => v.status === 'complete').length;
  const totalCount = 4;

  // Calculate active step
  const activeStep = currentVariantIndex ? currentVariantIndex - 1 : -1;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center' }}>
            <CodeOutlinedIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Generating Variants
            </Typography>
            <Typography color="text.secondary">
              {completedCount === totalCount
                ? 'All variants generated successfully!'
                : `${completedCount} of ${totalCount} variants complete`}
            </Typography>
          </Box>

          {/* Overall Progress */}
          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.round(overallPercent)}
              color={error ? 'error' : completedCount === totalCount ? 'success' : 'primary'}
              sx={{ height: 8, borderRadius: 1 }}
            />
            {currentMessage && (
              <Box sx={{ textAlign: 'center', mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CircularProgress size={14} />
                <Typography variant="body2" color="text.secondary">{currentMessage}</Typography>
              </Box>
            )}
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error">
              <Typography variant="subtitle2">Generation Error</Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          {/* Variant Steps */}
          <Stepper activeStep={activeStep} orientation="vertical">
            {plans.map((plan) => {
              const variant = variantStatusMap.get(plan.variant_index);
              const color = getVibeVariantColor(plan.variant_index);
              const label = getVibeVariantLabel(plan.variant_index);
              const status = variant?.status || 'pending';
              const isActive = plan.variant_index === currentVariantIndex;

              return (
                <Step key={plan.variant_index} completed={status === 'complete'}>
                  <StepLabel
                    icon={getVariantIcon(status)}
                    error={status === 'failed'}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={plan.variant_index}
                        size="small"
                        sx={{ bgcolor: color, color: 'white', fontWeight: 600, minWidth: 24 }}
                      />
                      <Typography fontWeight={isActive ? 600 : 400}>{label}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {plan.title}
                      </Typography>
                      {variant?.generation_duration_ms && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Generated in {(variant.generation_duration_ms / 1000).toFixed(1)}s
                        </Typography>
                      )}
                    </Box>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>

          {/* Completion Message */}
          {completedCount === totalCount && !error && (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              <Typography variant="subtitle2">All variants generated!</Typography>
              <Typography variant="body2">Click on any variant to preview and compare.</Typography>
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default GenerationProgress;
