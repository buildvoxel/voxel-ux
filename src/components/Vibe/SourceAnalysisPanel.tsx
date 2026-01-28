/**
 * SourceAnalysisPanel - Displays source preview and extracted UI metadata
 */

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaletteIcon from '@mui/icons-material/Palette';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { EmptyState } from '@/components';
import type { UIMetadata } from '../../services/screenAnalyzerService';

interface SourceAnalysisPanelProps {
  sourceHtml: string | null;
  metadata: UIMetadata | null;
  screenshotUrl?: string | null;
  isAnalyzing?: boolean;
  analysisMessage?: string;
}

const ColorSwatch: React.FC<{ color: string }> = ({ color }) => (
  <Tooltip title={color}>
    <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: color, border: '1px solid', borderColor: 'divider', display: 'inline-block', cursor: 'pointer' }} />
  </Tooltip>
);

const ColorSection: React.FC<{ title: string; colors: string[] }> = ({ title, colors }) => {
  if (!colors || colors.length === 0) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{title}</Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
        {colors.slice(0, 8).map((color, i) => <ColorSwatch key={`${color}-${i}`} color={color} />)}
      </Box>
    </Box>
  );
};

export const SourceAnalysisPanel: React.FC<SourceAnalysisPanelProps> = ({ sourceHtml, metadata, screenshotUrl, isAnalyzing, analysisMessage }) => {
  if (isAnalyzing) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>{analysisMessage || 'Analyzing screen...'}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!sourceHtml) {
    return <Card><CardContent><EmptyState title="No source HTML loaded" /></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader avatar={<WidgetsIcon />} title="Source Analysis" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }} />
      <CardContent sx={{ pt: 0 }}>
        {screenshotUrl && <Box sx={{ mb: 2 }}><img src={screenshotUrl} alt="Screen preview" style={{ width: '100%', borderRadius: 8, border: '1px solid #e0e0e0' }} /></Box>}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>HTML Size: {(sourceHtml.length / 1024).toFixed(1)} KB</Typography>
        {!metadata ? <EmptyState title="No analysis data" /> : (
          <Box>
            <Accordion defaultExpanded disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PaletteIcon fontSize="small" /><Typography variant="subtitle2">Colors</Typography></Box></AccordionSummary>
              <AccordionDetails>
                <ColorSection title="Primary" colors={metadata.colors.primary} />
                <ColorSection title="Secondary" colors={metadata.colors.secondary} />
                <ColorSection title="Background" colors={metadata.colors.background} />
                <ColorSection title="Text" colors={metadata.colors.text} />
                <ColorSection title="Accent" colors={metadata.colors.accent} />
              </AccordionDetails>
            </Accordion>
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TextFieldsIcon fontSize="small" /><Typography variant="subtitle2">Typography</Typography></Box></AccordionSummary>
              <AccordionDetails>
                {metadata.typography.fontFamilies.length > 0 && <Box sx={{ mb: 1.5 }}><Typography variant="caption" color="text.secondary">Font Families</Typography><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>{metadata.typography.fontFamilies.slice(0, 5).map((font, i) => <Chip key={i} label={font} size="small" />)}</Box></Box>}
                {metadata.typography.fontSizes.length > 0 && <Box><Typography variant="caption" color="text.secondary">Font Sizes</Typography><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>{metadata.typography.fontSizes.slice(0, 8).map((size, i) => <Chip key={i} label={size} size="small" />)}</Box></Box>}
              </AccordionDetails>
            </Accordion>
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><GridViewOutlinedIcon fontSize="small" /><Typography variant="subtitle2">Layout</Typography></Box></AccordionSummary>
              <AccordionDetails>
                {metadata.layout.gridSystems.length > 0 && <Box sx={{ mb: 1.5 }}><Typography variant="caption" color="text.secondary">Layout Systems</Typography><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>{metadata.layout.gridSystems.map((s, i) => <Chip key={i} label={s} size="small" color="primary" />)}</Box></Box>}
                {metadata.layout.breakpoints.length > 0 && <Box><Typography variant="caption" color="text.secondary">Breakpoints</Typography><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>{metadata.layout.breakpoints.map((bp, i) => <Chip key={i} label={bp} size="small" />)}</Box></Box>}
              </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WidgetsIcon fontSize="small" /><Typography variant="subtitle2">Components ({metadata.components.length})</Typography></Box></AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>{metadata.components.slice(0, 12).map((comp, i) => <Grid item xs={6} key={i}><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 0.5, px: 1, bgcolor: 'grey.50', borderRadius: 1 }}><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{comp.type}</Typography><Chip label={comp.count} size="small" /></Box></Grid>)}</Grid>
              </AccordionDetails>
            </Accordion>
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AccessibilityIcon fontSize="small" /><Typography variant="subtitle2">Accessibility</Typography></Box></AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{metadata.accessibility.hasAriaLabels ? <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} /> : <WarningIcon sx={{ color: 'warning.main', fontSize: 18 }} />}<Typography variant="body2">ARIA Labels: {metadata.accessibility.hasAriaLabels ? 'Present' : 'Missing'}</Typography></Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{metadata.accessibility.hasAltText ? <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} /> : <WarningIcon sx={{ color: 'warning.main', fontSize: 18 }} />}<Typography variant="body2">Alt Text: {metadata.accessibility.hasAltText ? 'Present' : 'Missing'}</Typography></Box>
                  {metadata.accessibility.semanticElements.length > 0 && <Box><Typography variant="caption" color="text.secondary">Semantic Elements</Typography><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>{metadata.accessibility.semanticElements.map((el, i) => <Chip key={i} label={`<${el}>`} size="small" color="success" />)}</Box></Box>}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceAnalysisPanel;
