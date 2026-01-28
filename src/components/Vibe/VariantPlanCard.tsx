/**
 * VariantPlanCard - Individual variant plan card with edit capability
 */

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import BrushIcon from '@mui/icons-material/Brush';
import { getVibeVariantColor, getVibeVariantLabel } from '../../store/vibeStore';
import type { VariantPlan } from '../../services/variantPlanService';

interface VariantPlanCardProps {
  plan: VariantPlan;
  onUpdate?: (updates: Partial<VariantPlan>) => void;
  isEditable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

export const VariantPlanCard: React.FC<VariantPlanCardProps> = ({
  plan,
  onUpdate,
  isEditable = true,
  isSelected = false,
  onSelect,
  compact = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(plan.title);
  const [editDescription, setEditDescription] = useState(plan.description);
  const [editKeyChanges, setEditKeyChanges] = useState(plan.key_changes.join('\n'));
  const [editStyleNotes, setEditStyleNotes] = useState(plan.style_notes || '');

  const color = getVibeVariantColor(plan.variant_index);
  const label = getVibeVariantLabel(plan.variant_index);

  const handleSave = () => {
    onUpdate?.({
      title: editTitle,
      description: editDescription,
      key_changes: editKeyChanges.split('\n').filter((line) => line.trim()),
      style_notes: editStyleNotes || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(plan.title);
    setEditDescription(plan.description);
    setEditKeyChanges(plan.key_changes.join('\n'));
    setEditStyleNotes(plan.style_notes || '');
    setIsEditing(false);
  };

  return (
    <Card
      sx={{
        cursor: onSelect ? 'pointer' : 'default',
        borderColor: isSelected ? color : 'divider',
        borderWidth: isSelected ? 2 : 1,
        borderStyle: 'solid',
        boxShadow: isSelected ? `0 0 8px ${color}40` : undefined,
        '&:hover': onSelect ? { boxShadow: 2 } : undefined,
      }}
      onClick={onSelect}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={plan.variant_index}
              size="small"
              sx={{ bgcolor: color, color: 'white', fontWeight: 600 }}
            />
            <Typography variant="subtitle2" fontWeight={600}>
              {label}
            </Typography>
          </Box>
        }
        action={
          isEditable && !isEditing && (
            <Tooltip title="Edit plan">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        {isEditing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Title Edit */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Title
              </Typography>
              <TextField
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                size="small"
                fullWidth
                onClick={(e) => e.stopPropagation()}
              />
            </Box>

            {/* Description Edit */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <TextField
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                multiline
                rows={2}
                size="small"
                fullWidth
                onClick={(e) => e.stopPropagation()}
              />
            </Box>

            {/* Key Changes Edit */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Key Changes (one per line)
              </Typography>
              <TextField
                value={editKeyChanges}
                onChange={(e) => setEditKeyChanges(e.target.value)}
                multiline
                rows={3}
                size="small"
                fullWidth
                placeholder="Enter each change on a new line"
                onClick={(e) => e.stopPropagation()}
              />
            </Box>

            {/* Style Notes Edit */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Style Notes
              </Typography>
              <TextField
                value={editStyleNotes}
                onChange={(e) => setEditStyleNotes(e.target.value)}
                multiline
                rows={2}
                size="small"
                fullWidth
                onClick={(e) => e.stopPropagation()}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
              >
                Save
              </Button>
              <Button
                size="small"
                startIcon={<CloseOutlinedIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : compact ? (
          // Compact view - show only title and truncated description
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <LightbulbIcon sx={{ color, fontSize: 14 }} />
              <Typography variant="body2" fontWeight={600}>
                {plan.title}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {plan.description}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LightbulbIcon sx={{ color }} />
              <Typography fontWeight={600}>{plan.title}</Typography>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {plan.description}
            </Typography>

            {/* Key Changes */}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}
              >
                <FormatListBulletedIcon sx={{ fontSize: 14 }} />
                Key Changes
              </Typography>
              <List dense disablePadding sx={{ ml: 1 }}>
                {plan.key_changes.map((change, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0 }}>
                    <Typography variant="body2">• {change}</Typography>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Style Notes */}
            {plan.style_notes && (
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}
                >
                  <BrushIcon sx={{ fontSize: 14 }} />
                  Style Notes
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {plan.style_notes}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantPlanCard;
