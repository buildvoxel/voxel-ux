/**
 * PlanReviewGrid - Grid of 4 variant plan cards for review
 */

import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { VariantPlanCard } from './VariantPlanCard';
import { EmptyState } from '@/components';
import type { VariantPlan } from '../../services/variantPlanService';

interface PlanReviewGridProps {
  plans: VariantPlan[];
  onUpdatePlan?: (variantIndex: number, updates: Partial<VariantPlan>) => void;
  onApprove?: () => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  loadingMessage?: string;
  isApproved?: boolean;
  modelInfo?: { model: string; provider: string };
  compact?: boolean;
}

export const PlanReviewGrid: React.FC<PlanReviewGridProps> = ({
  plans,
  onUpdatePlan,
  onApprove,
  onRegenerate,
  isLoading = false,
  loadingMessage,
  isApproved = false,
  modelInfo,
  compact = false,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={48} />
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI is designing your variants...
            </Typography>
            <Typography color="text.secondary">
              {loadingMessage || 'This may take a moment'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (plans.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="No variant plans generated yet"
            description="Enter a prompt to generate variant plans"
          />
        </CardContent>
      </Card>
    );
  }

  // Sort plans by variant_index
  const sortedPlans = [...plans].sort((a, b) => a.variant_index - b.variant_index);

  // Compact mode - just the grid, no header or actions
  if (compact) {
    return (
      <Grid container spacing={1.5}>
        {sortedPlans.map((plan) => (
          <Grid item key={plan.id} xs={12} sm={6} lg={3}>
            <VariantPlanCard
              plan={plan}
              onUpdate={(updates) => onUpdatePlan?.(plan.variant_index, updates)}
              isEditable={!isApproved}
              compact
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <RocketLaunchIcon />
            Review Variant Plans
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and edit the AI-generated concepts before generating code
          </Typography>
          {modelInfo && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Generated with {modelInfo.model} ({modelInfo.provider})
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={onRegenerate}
            disabled={isApproved}
          >
            Regenerate
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={onApprove}
            disabled={isApproved}
            size="large"
          >
            {isApproved ? 'Approved' : 'Approve & Generate Code'}
          </Button>
        </Box>
      </Box>

      {/* Approved Alert */}
      {isApproved && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mb: 2 }}
        >
          Plan approved! Generating variant code...
        </Alert>
      )}

      {/* Plans Grid */}
      <Grid container spacing={2}>
        {sortedPlans.map((plan) => (
          <Grid item key={plan.id} xs={12} sm={6} lg={3}>
            <VariantPlanCard
              plan={plan}
              onUpdate={(updates) => onUpdatePlan?.(plan.variant_index, updates)}
              isEditable={!isApproved}
            />
          </Grid>
        ))}
      </Grid>

      {/* Help Text */}
      {!isApproved && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: 'block', textAlign: 'center' }}
        >
          Click the edit icon on any card to customize the plan before generating code.
          Changes will affect the final output.
        </Typography>
      )}
    </Box>
  );
};

export default PlanReviewGrid;
